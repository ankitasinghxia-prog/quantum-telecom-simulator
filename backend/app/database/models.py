"""
Database models for Quantum Telecom Simulator
Updated for Pydantic V2 compatibility
"""

from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, Field, ConfigDict
from bson import ObjectId

class PyObjectId(str):
    """Custom ObjectId for MongoDB - Pydantic V2 compatible"""
    
    @classmethod
    def __get_pydantic_core_schema__(cls, source_type, handler):
        """Define how to validate and serialize ObjectId"""
        from pydantic_core import core_schema
        
        return core_schema.union_schema([
            # For string input
            core_schema.is_instance_schema(ObjectId),
            # For ObjectId input
            core_schema.no_info_plain_validator_function(
                lambda v: str(v) if isinstance(v, ObjectId) else v
            ),
        ], serialization=core_schema.plain_serializer_function_ser_schema(
            lambda v: str(v) if v else None
        ))

class Message(BaseModel):
    """Message model for secure communications"""
    model_config = ConfigDict(
        populate_by_name=True,
        arbitrary_types_allowed=True,
        json_encoders={ObjectId: str}
    )
    
    id: Optional[str] = Field(alias="_id", default=None)
    sender: str
    recipient: str
    encrypted: str
    decrypted: Optional[str] = None
    timestamp: datetime = Field(default_factory=datetime.now)

class QKDSession(BaseModel):
    """QKD Session model"""
    model_config = ConfigDict(
        populate_by_name=True,
        arbitrary_types_allowed=True,
        json_encoders={ObjectId: str}
    )
    
    id: Optional[str] = Field(alias="_id", default=None)
    session_id: str
    num_bits: int
    key_length: int
    error_rate: float
    eve_active: bool
    detected: bool
    created_at: datetime = Field(default_factory=datetime.now)

class AttackLog(BaseModel):
    """Attack log model"""
    model_config = ConfigDict(
        populate_by_name=True,
        arbitrary_types_allowed=True,
        json_encoders={ObjectId: str}
    )
    
    id: Optional[str] = Field(alias="_id", default=None)
    attack_type: str
    timestamp: datetime = Field(default_factory=datetime.now)
    detected: bool = True
    impact: str = "Error rate increased"
    status: str = "blocked"

class NetworkStatus(BaseModel):
    """Network status model"""
    model_config = ConfigDict(
        populate_by_name=True,
        arbitrary_types_allowed=True,
        json_encoders={ObjectId: str}
    )
    
    nodes: dict
    quantum_channel: dict
    total_messages: int
    total_attacks: int
    timestamp: datetime = Field(default_factory=datetime.now)

class KPIData(BaseModel):
    """KPI data model"""
    model_config = ConfigDict(
        populate_by_name=True,
        arbitrary_types_allowed=True,
        json_encoders={ObjectId: str}
    )
    
    total_secure_messages: int
    total_attacks_detected: int
    security_score: float
    network_availability: float
    quantum_key_strength: int
    error_rate: float
    attack_detection_rate: float
    timestamp: datetime = Field(default_factory=datetime.now)