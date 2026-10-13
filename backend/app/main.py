"""
Quantum Telecom Secure Simulator - Main Application
BSNL Internship Project - Phase 3
"""

from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import logging
import json
from datetime import datetime

from .config import settings
from .api.routes import router
from .database.crud import db_manager

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Create FastAPI app
app = FastAPI(
    title=settings.APP_NAME,
    description="Quantum Cryptography-Based Secure Communication Simulator for Telecom Networks",
    version=settings.APP_VERSION,
    docs_url="/docs",
    redoc_url="/redoc"
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API routes
app.include_router(router, prefix="/api")

# ============================================
# WEBSOCKET ENDPOINT
# ============================================

# Store active WebSocket connections
active_websockets = []

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    """
    WebSocket endpoint for real-time communication
    Handles: status updates, alerts, and real-time data
    """
    await websocket.accept()
    active_websockets.append(websocket)
    logger.info(f"✅ WebSocket connected: {websocket.client}")
    
    try:
        # Send initial connection confirmation
        await websocket.send_json({
            "type": "connection",
            "data": {
                "status": "connected",
                "message": "Welcome to Quantum Telecom Simulator WebSocket!",
                "timestamp": datetime.now().isoformat()
            }
        })
        
        while True:
            # Wait for messages from client
            data = await websocket.receive_text()
            
            try:
                message = json.loads(data)
                action = message.get("action", "")
                
                if action == "ping":
                    # Respond to ping
                    await websocket.send_json({
                        "type": "pong",
                        "data": {
                            "timestamp": datetime.now().isoformat()
                        }
                    })
                
                elif action == "get_status":
                    # Send network status
                    try:
                        from .api.routes import get_network_status
                        status = await get_network_status()
                        await websocket.send_json({
                            "type": "network_status",
                            "data": status
                        })
                    except Exception as e:
                        logger.error(f"Error getting network status: {e}")
                        await websocket.send_json({
                            "type": "error",
                            "data": {"message": str(e)}
                        })
                
                elif action == "get_qkd_status":
                    # Send QKD status
                    try:
                        from .api.routes import get_qkd_status
                        status = await get_qkd_status()
                        await websocket.send_json({
                            "type": "qkd_status",
                            "data": status
                        })
                    except Exception as e:
                        logger.error(f"Error getting QKD status: {e}")
                        await websocket.send_json({
                            "type": "error",
                            "data": {"message": str(e)}
                        })
                
                elif action == "attack_alert":
                    # Broadcast attack alert to all connected clients
                    alert_data = {
                        "type": "attack",
                        "data": {
                            "message": "⚠️ Quantum Attack Detected!",
                            "attack_type": message.get("attack_type", "unknown"),
                            "timestamp": datetime.now().isoformat()
                        }
                    }
                    for conn in active_websockets:
                        try:
                            await conn.send_json(alert_data)
                        except:
                            pass
                
                else:
                    # Unknown action
                    await websocket.send_json({
                        "type": "unknown_action",
                        "data": {"action": action, "message": "Action not recognized"}
                    })
                    
            except json.JSONDecodeError:
                logger.warning(f"Invalid JSON received: {data}")
                await websocket.send_json({
                    "type": "error",
                    "data": {"message": "Invalid JSON format"}
                })
                
    except WebSocketDisconnect:
        if websocket in active_websockets:
            active_websockets.remove(websocket)
        logger.info(f"❌ WebSocket disconnected: {websocket.client}")
    except Exception as e:
        logger.error(f"WebSocket error: {e}")
        if websocket in active_websockets:
            active_websockets.remove(websocket)


# ============================================
# ROOT ENDPOINTS
# ============================================

@app.get("/")
async def root():
    """
    Root endpoint - API information
    """
    return {
        "name": settings.APP_NAME,
        "version": settings.APP_VERSION,
        "status": "running",
        "docs": "/docs",
        "websocket": "ws://localhost:8000/ws",
        "timestamp": datetime.now().isoformat()
    }

@app.get("/health")
async def health_check():
    """
    Health check endpoint
    """
    db_status = "connected" if db_manager.is_connected() else "disconnected"
    return {
        "status": "healthy",
        "database": db_status,
        "websocket_connections": len(active_websockets),
        "timestamp": datetime.now().isoformat()
    }


# ============================================
# SHUTDOWN HANDLER
# ============================================

@app.on_event("shutdown")
async def shutdown_event():
    """Close database connections and WebSocket connections on shutdown"""
    logger.info("Shutting down application...")
    
    # Close all WebSocket connections
    for ws in active_websockets:
        try:
            await ws.close()
        except:
            pass
    
    # Close database connection
    db_manager.close()
    logger.info("✅ Application shutdown complete")


# ============================================
# MAIN ENTRY POINT
# ============================================

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=settings.PORT,
        reload=True
    )