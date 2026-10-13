"""
CRUD operations for database
Updated for Pydantic V2 compatibility
"""

import logging
from typing import Optional, List
from datetime import datetime
from pymongo import MongoClient
from pymongo.errors import ConnectionFailure

from ..config import settings

logger = logging.getLogger(__name__)

class DatabaseManager:
    """Database manager for MongoDB operations"""
    
    def __init__(self):
        """Initialize database connection"""
        self.client = None
        self.db = None
        self.connect()
    
    def connect(self):
        """Connect to MongoDB"""
        try:
            self.client = MongoClient(settings.MONGODB_URI)
            self.db = self.client[settings.DATABASE_NAME]
            # Test connection
            self.client.admin.command('ping')
            logger.info(f"✅ Connected to MongoDB: {settings.DATABASE_NAME}")
            
            # Create collections if they don't exist
            self._ensure_collections()
            
        except ConnectionFailure as e:
            logger.warning(f"⚠️ MongoDB connection failed: {e}")
            logger.warning("💡 Run MongoDB locally or continue with in-memory storage")
            self.db = None
        except Exception as e:
            logger.error(f"❌ Database error: {e}")
            self.db = None
    
    def _ensure_collections(self):
        """Ensure required collections exist"""
        if not self.db:
            return
        
        collections = ['messages', 'qkd_sessions', 'attack_logs']
        for collection in collections:
            if collection not in self.db.list_collection_names():
                self.db.create_collection(collection)
                logger.info(f"✅ Created collection: {collection}")
    
    def is_connected(self) -> bool:
        """Check if database is connected"""
        return self.db is not None
    
    # ============ Message Operations ============
    
    def save_message(self, message_data: dict) -> dict:
        """Save a message to database"""
        if not self.is_connected():
            return {"status": "saved_to_memory"}
        
        try:
            result = self.db.messages.insert_one(message_data)
            return {"id": str(result.inserted_id), "status": "saved"}
        except Exception as e:
            logger.error(f"Error saving message: {e}")
            return {"status": "error", "error": str(e)}
    
    def get_messages(self, limit: int = 50) -> List[dict]:
        """Get recent messages"""
        if not self.is_connected():
            return []
        
        try:
            # Convert ObjectId to string for JSON serialization
            messages = list(self.db.messages.find().sort("timestamp", -1).limit(limit))
            for msg in messages:
                if '_id' in msg:
                    msg['_id'] = str(msg['_id'])
            return messages
        except Exception as e:
            logger.error(f"Error getting messages: {e}")
            return []
    
    # ============ QKD Session Operations ============
    
    def save_qkd_session(self, session_data: dict) -> dict:
        """Save a QKD session"""
        if not self.is_connected():
            return {"status": "saved_to_memory"}
        
        try:
            result = self.db.qkd_sessions.insert_one(session_data)
            return {"id": str(result.inserted_id), "status": "saved"}
        except Exception as e:
            logger.error(f"Error saving QKD session: {e}")
            return {"status": "error", "error": str(e)}
    
    def get_qkd_sessions(self, limit: int = 20) -> List[dict]:
        """Get recent QKD sessions"""
        if not self.is_connected():
            return []
        
        try:
            sessions = list(self.db.qkd_sessions.find().sort("created_at", -1).limit(limit))
            for s in sessions:
                if '_id' in s:
                    s['_id'] = str(s['_id'])
            return sessions
        except Exception as e:
            logger.error(f"Error getting QKD sessions: {e}")
            return []
    
    # ============ Attack Log Operations ============
    
    def save_attack(self, attack_data: dict) -> dict:
        """Save an attack log"""
        if not self.is_connected():
            return {"status": "saved_to_memory"}
        
        try:
            result = self.db.attack_logs.insert_one(attack_data)
            return {"id": str(result.inserted_id), "status": "saved"}
        except Exception as e:
            logger.error(f"Error saving attack: {e}")
            return {"status": "error", "error": str(e)}
    
    def get_attacks(self, limit: int = 50) -> List[dict]:
        """Get recent attack logs"""
        if not self.is_connected():
            return []
        
        try:
            attacks = list(self.db.attack_logs.find().sort("timestamp", -1).limit(limit))
            for a in attacks:
                if '_id' in a:
                    a['_id'] = str(a['_id'])
            return attacks
        except Exception as e:
            logger.error(f"Error getting attacks: {e}")
            return []
    
    # ============ KPI Operations ============
    
    def get_kpi_data(self) -> dict:
        """Get KPI data from database"""
        if not self.is_connected():
            return {
                "total_messages": 0,
                "total_attacks": 0,
                "total_sessions": 0,
                "avg_error_rate": 0
            }
        
        try:
            total_messages = self.db.messages.count_documents({})
            total_attacks = self.db.attack_logs.count_documents({})
            total_sessions = self.db.qkd_sessions.count_documents({})
            
            # Get average error rate
            sessions = list(self.db.qkd_sessions.find({}, {"error_rate": 1}))
            avg_error = sum(s.get("error_rate", 0) for s in sessions) / len(sessions) if sessions else 0
            
            return {
                "total_messages": total_messages,
                "total_attacks": total_attacks,
                "total_sessions": total_sessions,
                "avg_error_rate": avg_error,
                "success_rate": (total_sessions - total_attacks) / total_sessions if total_sessions > 0 else 100
            }
        except Exception as e:
            logger.error(f"Error getting KPI data: {e}")
            return {}
    
    def close(self):
        """Close database connection"""
        if self.client:
            self.client.close()
            logger.info("Database connection closed")

# Global database instance
db_manager = DatabaseManager()