"""
Configuration settings for Quantum Telecom Simulator
"""

import os
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

class Settings:
    """Application settings"""
    
    # API Settings
    APP_NAME: str = "Quantum Telecom Secure Simulator"
    APP_VERSION: str = "1.0.0"
    PORT: int = int(os.getenv("PORT", 8000))
    SECRET_KEY: str = os.getenv("SECRET_KEY", "dev-secret-key-12345")
    
    # Quantum Settings
    QUANTUM_THRESHOLD: float = float(os.getenv("QUANTUM_THRESHOLD", 0.1))
    DEFAULT_QUBITS: int = int(os.getenv("DEFAULT_QUBITS", 256))
    
    # Database Settings
    MONGODB_URI: str = os.getenv("MONGODB_URI", "mongodb://localhost:27017")
    DATABASE_NAME: str = os.getenv("DATABASE_NAME", "quantum_telecom")
    
    # CORS Settings
    ALLOWED_ORIGINS: list = [
        "http://localhost:5173",
        "http://localhost:3000",
        "http://127.0.0.1:5173"
    ]
    
    # Simulation Settings
    SIMULATION_SPEED: float = float(os.getenv("SIMULATION_SPEED", 1.0))
    PACKET_LOSS_RATE: float = float(os.getenv("PACKET_LOSS_RATE", 0.01))
    
    class Config:
        env_file = ".env"

settings = Settings()
print(f"✅ Configuration loaded for {settings.APP_NAME}")