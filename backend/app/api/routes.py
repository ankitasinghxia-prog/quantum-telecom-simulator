"""
API Routes for Quantum Telecom Simulator - COMPLETE
"""

from fastapi import APIRouter, HTTPException, WebSocket, WebSocketDisconnect, Request
from typing import Optional, Dict, List
from datetime import datetime
import json
import uuid

from ..quantum_engine.bb84 import BB84Protocol
from ..database.models import Message, QKDSession, AttackLog
from ..database.crud import db_manager
from ..network.simulator import NetworkSimulator
from ..network.nodes import Alice, Bob, Eve

router = APIRouter()

# ============================================
# GLOBAL STATE
# ============================================

_quantum_key = None
_quantum_key_length = 0
_quantum_error_rate = 0.0
_quantum_key_preview = None
_key_compromised = False
_attack_count = 0
_message_count = 0
_messages_sent_list = []

in_memory = {
    "messages": [],
    "qkd_sessions": [],
    "attacks": [],
    "current_key": None,
    "last_bb84_result": None
}

active_connections: Dict[str, WebSocket] = {}
network_sim = NetworkSimulator()


# ============================================
# QKD ENDPOINTS
# ============================================

@router.post("/qkd/init")
async def init_qkd(num_bits: int = 256, eve_active: bool = False):
    global _quantum_key, _quantum_key_length, _quantum_error_rate, _quantum_key_preview, _key_compromised
    
    try:
        if num_bits < 16:
            raise HTTPException(status_code=400, detail="Minimum 16 qubits required")
        
        bb84 = BB84Protocol(num_bits=num_bits)
        result = bb84.run_full_protocol(eve_active=eve_active, verbose=False)
        
        secret_key = bb84.get_secret_key()
        
        _quantum_key = secret_key
        _quantum_key_length = len(secret_key) if secret_key else 0
        _quantum_error_rate = result.get("error_rate", 0.0)
        _quantum_key_preview = bb84.get_key_as_string()[:64] + "..." if secret_key and len(secret_key) > 64 else bb84.get_key_as_string() if secret_key else None
        _key_compromised = result.get("detected", False)
        
        in_memory["last_bb84_result"] = result
        in_memory["current_key"] = secret_key
        
        if not _key_compromised:
            _message_count = len(_messages_sent_list)
        
        return {
            "success": True,
            "key_length": _quantum_key_length,
            "error_rate": _quantum_error_rate,
            "detected": _key_compromised,
            "key_preview": _quantum_key_preview,
            "timestamp": datetime.now().isoformat()
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/qkd/status")
async def get_qkd_status():
    global _quantum_key, _quantum_key_length, _quantum_error_rate, _quantum_key_preview, _key_compromised
    
    has_key = _quantum_key is not None and len(_quantum_key) > 0
    
    return {
        "status": "active" if has_key else "inactive",
        "has_key": has_key,
        "key_length": _quantum_key_length if has_key else 0,
        "error_rate": _quantum_error_rate if has_key else 0.0,
        "compromised": _key_compromised,
        "key_preview": _quantum_key_preview if has_key else None,
        "timestamp": datetime.now().isoformat()
    }


# ============================================
# NETWORK SIMULATOR ENDPOINTS
# ============================================

@router.post("/network/simulate/qkd")
async def simulate_qkd(num_bits: int = 256, eve_active: bool = False):
    global _quantum_key, _quantum_key_length, _quantum_error_rate, _quantum_key_preview, _key_compromised
    
    try:
        result = network_sim.generate_quantum_key(num_bits, eve_active)
        
        if result.get("success") and not result.get("detected"):
            _quantum_key = network_sim.alice.quantum_key
            _quantum_key_length = len(_quantum_key) if _quantum_key else 0
            _quantum_error_rate = result.get("error_rate", 0.0)
            _quantum_key_preview = str(_quantum_key)[:64] + "..." if _quantum_key and len(_quantum_key) > 64 else str(_quantum_key) if _quantum_key else None
            _key_compromised = False
            _message_count = len(_messages_sent_list)
        else:
            _key_compromised = result.get("detected", False)
        
        return {
            "success": True,
            "result": result,
            "timestamp": datetime.now().isoformat()
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/network/simulate/message")
async def simulate_message(
    message: Optional[str] = None,
    request: Request = None
):
    global _quantum_key, _key_compromised, _message_count, _messages_sent_list
    
    try:
        msg = message
        if not msg and request:
            try:
                body = await request.json()
                msg = body.get("message", "")
            except:
                pass
        
        if not msg or len(msg.strip()) == 0:
            raise HTTPException(status_code=400, detail="Message cannot be empty")
        
        if _quantum_key is None or len(_quantum_key) == 0:
            raise HTTPException(status_code=400, detail="No quantum key available. Run QKD first.")
        
        if _key_compromised:
            raise HTTPException(status_code=400, detail="⚠️ KEY COMPROMISED! Generate a new key.")
        
        result = network_sim.send_secure_message(msg)
        
        # Count unique messages
        message_id = f"{datetime.now().isoformat()}_{msg[:20]}"
        if message_id not in _messages_sent_list:
            _messages_sent_list.append(message_id)
            _message_count = len(_messages_sent_list)
        
        # Store in memory
        message_data = {
            "id": len(in_memory["messages"]) + 1,
            "sender": "Alice",
            "message": msg,
            "encrypted": True,
            "timestamp": datetime.now().isoformat()
        }
        in_memory["messages"].append(message_data)
        
        return {
            "success": True,
            "message": result,
            "message_count": _message_count,
            "timestamp": datetime.now().isoformat()
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/network/simulate/attack")
async def simulate_network_attack(attack_type: str = "intercept_resend"):
    global _key_compromised, _quantum_error_rate, _attack_count
    
    try:
        valid_attacks = ["intercept_resend", "man_in_the_middle", "denial_of_service"]
        if attack_type not in valid_attacks:
            raise HTTPException(status_code=400, detail=f"Invalid attack type")
        
        result = network_sim.simulate_attack(attack_type)
        
        _key_compromised = True
        _quantum_error_rate = result.get("error_rate", 0.15)
        _attack_count += 1
        
        attack_data = {
            "id": len(in_memory["attacks"]) + 1,
            "type": attack_type,
            "timestamp": datetime.now().isoformat(),
            "detected": True,
            "impact": f"Error rate: {_quantum_error_rate*100:.1f}%",
            "status": "blocked"
        }
        in_memory["attacks"].append(attack_data)
        db_manager.save_attack(attack_data)
        
        for conn in active_connections.values():
            try:
                await conn.send_json({
                    "type": "attack",
                    "data": {
                        "message": f"⚠️ {attack_type} Attack Detected!",
                        "attack_type": attack_type,
                        "error_rate": _quantum_error_rate,
                        "attack_count": _attack_count,
                        "timestamp": datetime.now().isoformat()
                    }
                })
            except:
                pass
        
        return {
            "success": True,
            "result": result,
            "attack_count": _attack_count,
            "error_rate": _quantum_error_rate,
            "key_compromised": _key_compromised,
            "timestamp": datetime.now().isoformat()
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/network/simulator/status")
async def get_simulator_status():
    try:
        status = network_sim.get_network_status()
        status["quantum_key"] = {
            "has_key": _quantum_key is not None and len(_quantum_key) > 0,
            "key_length": _quantum_key_length,
            "error_rate": _quantum_error_rate,
            "compromised": _key_compromised
        }
        status["counts"] = {
            "messages": _message_count,
            "attacks": _attack_count
        }
        return status
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/network/simulator/reset")
async def reset_simulator():
    global _quantum_key, _quantum_key_length, _quantum_error_rate, _quantum_key_preview, _key_compromised, _attack_count, _message_count, _messages_sent_list
    
    try:
        _quantum_key = None
        _quantum_key_length = 0
        _quantum_error_rate = 0.0
        _quantum_key_preview = None
        _key_compromised = False
        _attack_count = 0
        _message_count = 0
        _messages_sent_list = []
        
        in_memory["current_key"] = None
        in_memory["last_bb84_result"] = None
        in_memory["messages"] = []
        in_memory["attacks"] = []
        
        network_sim.reset_simulation()
        
        return {
            "success": True,
            "message": "Simulator reset successfully",
            "timestamp": datetime.now().isoformat()
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/network/simulator/demo")
async def run_simulator_demo():
    try:
        await simulate_qkd(256, False)
        
        messages = [
            "Hello Bob! This is Alice.",
            "This message is encrypted with quantum key.",
            "Quantum cryptography is the future of telecom security!",
            "BSNL is leading the way in secure communications.",
            "📡 Quantum Telecom Simulator v1.0"
        ]
        for msg in messages:
            await simulate_message(msg)
        
        attack_result = await simulate_network_attack("intercept_resend")
        
        return {
            "success": True,
            "results": {
                "messages_sent": len(messages),
                "attack": attack_result
            },
            "timestamp": datetime.now().isoformat()
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ============================================
# KPI ENDPOINT
# ============================================

@router.get("/kpi/analysis")
async def get_kpi_analysis():
    has_key = _quantum_key is not None and len(_quantum_key) > 0
    
    security_score = 100
    if _key_compromised:
        security_score = 50
    if _attack_count > 0:
        security_score = max(0, security_score - (_attack_count * 10))
    if not has_key:
        security_score = 0
    
    return {
        "total_secure_messages": _message_count,
        "total_attacks_detected": _attack_count,
        "security_score": security_score,
        "network_availability": max(0, 99.9 - (_attack_count * 0.5)),
        "quantum_key_strength": _quantum_key_length if has_key else 0,
        "error_rate": _quantum_error_rate if has_key else 0,
        "attack_detection_rate": 100 if _attack_count > 0 else 0,
        "message_encryption_rate": 100 if _message_count > 0 and has_key else 0,
        "key_compromised": _key_compromised,
        "timestamp": datetime.now().isoformat()
    }


@router.get("/network/status")
async def get_network_status():
    has_key = _quantum_key is not None and len(_quantum_key) > 0
    
    return {
        "nodes": {
            "alice": {
                "status": "active",
                "connected": True,
                "has_key": has_key,
                "messages_sent": _message_count
            },
            "bob": {
                "status": "active",
                "connected": True,
                "has_key": has_key,
                "messages_received": _message_count
            },
            "eve": {
                "status": "active" if _key_compromised else "inactive",
                "attacks": _attack_count
            }
        },
        "quantum_channel": {
            "status": "compromised" if _key_compromised else ("secure" if has_key else "uninitialized"),
            "key_strength": _quantum_key_length if has_key else 0,
            "error_rate": _quantum_error_rate if has_key else 0,
            "compromised": _key_compromised
        },
        "kpi": {
            "quantum_key_strength": _quantum_key_length if has_key else 0,
            "error_rate": _quantum_error_rate if has_key else 0,
            "total_messages": _message_count,
            "total_attacks": _attack_count,
            "key_compromised": _key_compromised
        },
        "total_messages": _message_count,
        "total_attacks": _attack_count,
        "timestamp": datetime.now().isoformat()
    }


# ============================================
# MESSAGE HISTORY ENDPOINT - ADDED
# ============================================

@router.get("/message/history")
async def get_message_history(limit: int = 50):
    """
    Get message history
    """
    try:
        messages = in_memory.get("messages", [])
        
        formatted_messages = []
        for msg in messages[-limit:]:
            formatted_messages.append({
                "id": msg.get("id", 0),
                "sender": msg.get("sender", "Alice"),
                "message": msg.get("message", msg.get("encrypted", "")),
                "encrypted": msg.get("encrypted", True),
                "timestamp": msg.get("timestamp", datetime.now().isoformat())
            })
        
        return {
            "messages": formatted_messages,
            "total": len(formatted_messages),
            "timestamp": datetime.now().isoformat()
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get messages: {str(e)}")


# ============================================
# ATTACK LOGS ENDPOINT - ADDED
# ============================================

@router.get("/attack/logs")
async def get_attack_logs(limit: int = 50):
    """
    Get attack logs
    """
    try:
        attacks = in_memory.get("attacks", [])
        
        return {
            "attacks": attacks[-limit:],
            "total": len(attacks),
            "timestamp": datetime.now().isoformat()
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get attack logs: {str(e)}")


# ============================================
# WEBSOCKET ENDPOINT
# ============================================

@router.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    client_id = str(id(websocket))
    active_connections[client_id] = websocket
    
    try:
        await websocket.send_json({
            "type": "connection",
            "data": {"status": "connected", "timestamp": datetime.now().isoformat()}
        })
        
        while True:
            data = await websocket.receive_json()
            action = data.get("action")
            
            if action == "ping":
                await websocket.send_json({
                    "type": "pong",
                    "data": {"timestamp": datetime.now().isoformat()}
                })
            
            elif action == "qkd_status":
                has_key = _quantum_key is not None and len(_quantum_key) > 0
                await websocket.send_json({
                    "type": "qkd_status",
                    "data": {
                        "has_key": has_key,
                        "key_length": _quantum_key_length if has_key else 0,
                        "error_rate": _quantum_error_rate if has_key else 0,
                        "compromised": _key_compromised,
                        "timestamp": datetime.now().isoformat()
                    }
                })
            
            elif action == "network_status" or action == "get_status":
                status = await get_network_status()
                await websocket.send_json({
                    "type": "network_status",
                    "data": status
                })
                
    except WebSocketDisconnect:
        if client_id in active_connections:
            del active_connections[client_id]
    except Exception as e:
        print(f"WebSocket error: {e}")
        if client_id in active_connections:
            del active_connections[client_id]