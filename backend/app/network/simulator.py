"""
Network Simulator for Quantum Telecom
Orchestrates all nodes and channel communication
"""

import logging
import random
from datetime import datetime
from typing import Optional, Dict, Any, List

from .nodes import Alice, Bob, Eve
from .channel import QuantumChannel
from ..quantum_engine.bb84 import BB84Protocol

logger = logging.getLogger(__name__)


class NetworkSimulator:
    """
    Main network simulator orchestrating quantum secure communication
    
    Features:
    - QKD generation with/without Eve
    - Secure message transmission
    - Attack simulation
    - Network monitoring
    - KPI tracking
    """
    
    def __init__(self):
        """Initialize the network simulator"""
        self.alice = Alice()
        self.bob = Bob()
        self.eve = Eve()
        self.channel = QuantumChannel()
        self.channel.connect_nodes(self.alice, self.bob, self.eve)
        
        self.is_running = False
        self.simulation_logs: List[Dict] = []
        self.kpi_data: Dict = {}
        
        logger.info("✅ Network Simulator initialized")
        logger.info(f"📊 Nodes: {self.alice.name}, {self.bob.name}, {self.eve.name}")
    
    def generate_quantum_key(self, num_bits: int = 256, eve_active: bool = False) -> Dict:
        """
        Generate quantum key using BB84 protocol
        
        Args:
            num_bits: Number of qubits
            eve_active: Whether Eve is active
        
        Returns:
            QKD results
        """
        logger.info(f"🔐 Starting QKD with {num_bits} qubits (Eve: {eve_active})")
        
        # Activate/deactivate Eve
        if eve_active:
            self.eve.activate("intercept_resend")
        else:
            self.eve.deactivate()
        
        # Alice generates quantum key
        result = self.alice.generate_quantum_key(num_bits, eve_active)
        
        # Bob receives the key
        if result["success"] and not result["detected"]:
            self.bob.receive_quantum_key(self.alice.quantum_key)
            logger.info(f"✅ Quantum key shared securely! Length: {len(self.bob.quantum_key)} bits")
        elif result["detected"]:
            logger.warning("⚠️ EAVESDROPPING DETECTED! Key is not secure.")
        
        # Log the simulation
        log_entry = {
            "type": "qkd",
            "num_bits": num_bits,
            "eve_active": eve_active,
            "success": result["success"],
            "detected": result["detected"],
            "key_length": result["key_length"],
            "error_rate": result["error_rate"],
            "timestamp": datetime.now().isoformat()
        }
        self.simulation_logs.append(log_entry)
        
        return result
    
    def send_secure_message(self, message: str) -> Optional[Dict]:
        """
        Send a secure message from Alice to Bob
        
        Args:
            message: Message to send
        
        Returns:
            Message data or None if failed
        """
        if not self.alice.quantum_key:
            logger.error("❌ No quantum key available! Run QKD first.")
            return None
        
        if self.alice.quantum_key != self.bob.quantum_key:
            logger.error("❌ Quantum keys don't match! Run QKD again.")
            return None
        
        logger.info(f"📤 Alice sending secure message: {message[:50]}{'...' if len(message) > 50 else ''}")
        
        # Send secure message through channel
        msg_data = self.channel.transmit_message(
            self.alice, 
            self.bob, 
            message, 
            encrypted=True
        )
        
        if msg_data:
            # Log the message
            log_entry = {
                "type": "secure_message",
                "sender": "Alice",
                "recipient": "Bob",
                "message": message,
                "encrypted": True,
                "timestamp": datetime.now().isoformat()
            }
            self.simulation_logs.append(log_entry)
            
            # Update KPI data
            self._update_kpi()
        
        return msg_data
    
    def simulate_attack(self, attack_type: str = "intercept_resend") -> Dict:
        """
        Simulate a cyber attack on the quantum channel
        
        Args:
            attack_type: Type of attack
        
        Returns:
            Attack results
        """
        valid_attacks = ["intercept_resend", "man_in_the_middle", "denial_of_service"]
        if attack_type not in valid_attacks:
            logger.warning(f"⚠️ Unknown attack type: {attack_type}. Using 'intercept_resend'")
            attack_type = "intercept_resend"
        
        logger.warning(f"⚠️ Simulating {attack_type} attack!")
        
        # Activate Eve
        self.eve.activate(attack_type)
        
        # Run QKD with Eve active
        result = self.generate_quantum_key(num_bits=128, eve_active=True)
        
        attack_result = {
            "attack_type": attack_type,
            "timestamp": datetime.now().isoformat(),
            "detected": result["detected"],
            "error_rate": result["error_rate"],
            "key_length_affected": result["key_length"],
            "status": "blocked" if result["detected"] else "successful"
        }
        
        # Log the attack
        log_entry = {
            "type": "attack",
            "attack_type": attack_type,
            "detected": result["detected"],
            "timestamp": datetime.now().isoformat()
        }
        self.simulation_logs.append(log_entry)
        
        # Deactivate Eve after attack
        self.eve.deactivate()
        
        return attack_result
    
    def _update_kpi(self) -> None:
        """Update KPI data"""
        total_messages = len([log for log in self.simulation_logs if log["type"] == "secure_message"])
        total_attacks = len([log for log in self.simulation_logs if log["type"] == "attack"])
        
        # Calculate security score
        security_score = 100 - (total_attacks * 2)
        if security_score < 0:
            security_score = 0
        
        # Calculate network availability
        availability = 99.9 - (total_attacks * 0.1)
        if availability < 0:
            availability = 0
        
        self.kpi_data = {
            "total_secure_messages": total_messages,
            "total_attacks_detected": total_attacks,
            "security_score": security_score,
            "network_availability": availability,
            "quantum_key_strength": len(self.alice.quantum_key) if self.alice.quantum_key else 0,
            "error_rate": self.channel.stats.error_rate,
            "attack_detection_rate": 100 if total_attacks > 0 else 0,
            "message_encryption_rate": 100 if total_messages > 0 else 0,
            "last_update": datetime.now().isoformat()
        }
    
    def get_network_status(self) -> Dict:
        """Get current network status"""
        return {
            "nodes": {
                "alice": {
                    "name": self.alice.name,
                    "status": "active" if self.alice.is_active else "inactive",
                    "messages_sent": self.alice.messages_sent_count,
                    "messages_received": self.alice.messages_received_count,
                    "has_key": self.alice.quantum_key is not None
                },
                "bob": {
                    "name": self.bob.name,
                    "status": "active" if self.bob.is_active else "inactive",
                    "messages_sent": self.bob.messages_sent_count,
                    "messages_received": self.bob.messages_received_count,
                    "has_key": self.bob.quantum_key is not None
                },
                "eve": {
                    "name": self.eve.name,
                    "status": "active" if self.eve.is_active else "inactive",
                    "attack_type": self.eve.attack_type,
                    "total_attacks": len(self.eve.attack_logs)
                }
            },
            "quantum_channel": {
                "status": "secure" if self.channel.is_secure else "compromised",
                "packet_loss": self.channel.packet_loss,
                "latency": self.channel.latency,
                "error_rate": self.channel.stats.error_rate
            },
            "kpi": self.kpi_data,
            "total_simulations": len(self.simulation_logs),
            "timestamp": datetime.now().isoformat()
        }
    
    def get_simulation_logs(self, limit: int = 20) -> List[Dict]:
        """Get simulation logs"""
        return self.simulation_logs[-limit:]
    
    def reset_simulation(self) -> None:
        """Reset the simulation"""
        self.alice.quantum_key = None
        self.bob.quantum_key = None
        self.eve.deactivate()
        self.channel.clear_history()
        self.simulation_logs = []
        self.kpi_data = {}
        logger.info("🔄 Simulation reset")
    
    def run_demo(self) -> Dict:
        """
        Run a complete demo of the quantum secure communication system
        
        Returns:
            Demo results
        """
        logger.info("=" * 60)
        logger.info("🎯 Running Quantum Secure Communication Demo")
        logger.info("=" * 60)
        
        results = {
            "qkd": [],
            "messages": [],
            "attacks": []
        }
        
        # 1. Generate quantum key (no Eve)
        logger.info("\n📌 Step 1: Generating quantum key (secure channel)...")
        result1 = self.generate_quantum_key(num_bits=256, eve_active=False)
        results["qkd"].append(result1)
        
        # 2. Send secure messages
        logger.info("\n📌 Step 2: Sending secure messages...")
        messages = [
            "Hello Bob! This is Alice.",
            "This message is encrypted with quantum key.",
            "Quantum cryptography is the future of telecom security!",
            "BSNL is leading the way in secure communications.",
            "📡 Quantum Telecom Simulator v1.0"
        ]
        
        for msg in messages:
            result = self.send_secure_message(msg)
            if result:
                results["messages"].append(result)
        
        # 3. Simulate attack
        logger.info("\n📌 Step 3: Simulating quantum attack...")
        attack_result = self.simulate_attack("intercept_resend")
        results["attacks"].append(attack_result)
        
        # 4. Check status
        logger.info("\n📌 Step 4: Network Status:")
        status = self.get_network_status()
        logger.info(f"   🔑 Key: {'Yes' if status['nodes']['alice']['has_key'] else 'No'}")
        logger.info(f"   📊 Security Score: {status['kpi']['security_score']}%")
        logger.info(f"   🛡️  Attacks Detected: {status['kpi']['total_attacks_detected']}")
        logger.info(f"   📨 Messages Sent: {status['kpi']['total_secure_messages']}")
        
        logger.info("\n" + "=" * 60)
        logger.info("✅ Demo Complete!")
        logger.info("=" * 60)
        
        return results