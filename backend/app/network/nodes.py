"""
Network Nodes for Quantum Telecom Simulator
Alice, Bob, and Eve classes with real-time communication
"""

import logging
import random
import uuid
from datetime import datetime
from typing import Optional, List, Dict, Any
from dataclasses import dataclass, field

from ..quantum_engine.bb84 import BB84Protocol

logger = logging.getLogger(__name__)


@dataclass
class Message:
    """Message data structure"""
    id: str
    sender: str
    recipient: str
    content: str
    encrypted: bool
    timestamp: str
    status: str = "sent"  # sent, delivered, read


@dataclass
class NodeStatus:
    """Node status data structure"""
    name: str
    ip: str
    port: int
    is_active: bool
    connected_to: List[str]
    messages_sent: int
    messages_received: int
    last_activity: str


class NetworkNode:
    """Base class for network nodes"""
    
    def __init__(self, name: str, ip: str, port: int):
        self.name = name
        self.ip = ip
        self.port = port
        self.is_active = True
        self.connected_nodes: List[str] = []
        self.messages: List[Message] = []
        self.messages_sent_count = 0
        self.messages_received_count = 0
        self.logger = logging.getLogger(f"{name}_node")
        
        self.logger.info(f"✅ Node {name} initialized at {ip}:{port}")
    
    def connect_to(self, node: 'NetworkNode') -> bool:
        """Connect to another node"""
        if node.name not in self.connected_nodes:
            self.connected_nodes.append(node.name)
            self.logger.info(f"🔗 Connected to {node.name}")
            return True
        return False
    
    def disconnect_from(self, node_name: str) -> bool:
        """Disconnect from another node"""
        if node_name in self.connected_nodes:
            self.connected_nodes.remove(node_name)
            self.logger.info(f"🔌 Disconnected from {node_name}")
            return True
        return False
    
    def send_message(self, recipient: str, content: str, encrypted: bool = False) -> Optional[Message]:
        """Send a message to another node"""
        if not self.is_active:
            self.logger.warning(f"❌ Node {self.name} is inactive")
            return None
        
        message = Message(
            id=str(uuid.uuid4())[:8],
            sender=self.name,
            recipient=recipient,
            content=content,
            encrypted=encrypted,
            timestamp=datetime.now().isoformat(),
            status="sent"
        )
        
        self.messages.append(message)
        self.messages_sent_count += 1
        
        self.logger.info(f"📤 Message sent to {recipient}: {content[:50]}{'...' if len(content) > 50 else ''}")
        return message
    
    def receive_message(self, message: Message) -> bool:
        """Receive a message from another node"""
        if not self.is_active:
            self.logger.warning(f"❌ Node {self.name} is inactive")
            return False
        
        message.status = "delivered"
        self.messages.append(message)
        self.messages_received_count += 1
        
        self.logger.info(f"📥 Message received from {message.sender}: {message.content[:50]}{'...' if len(message.content) > 50 else ''}")
        return True
    
    def get_status(self) -> NodeStatus:
        """Get node status"""
        return NodeStatus(
            name=self.name,
            ip=self.ip,
            port=self.port,
            is_active=self.is_active,
            connected_to=self.connected_nodes,
            messages_sent=self.messages_sent_count,
            messages_received=self.messages_received_count,
            last_activity=datetime.now().isoformat()
        )
    
    def get_messages(self, limit: int = 10) -> List[Dict]:
        """Get recent messages"""
        return [
            {
                "id": m.id,
                "sender": m.sender,
                "recipient": m.recipient,
                "content": m.content,
                "encrypted": m.encrypted,
                "timestamp": m.timestamp,
                "status": m.status
            }
            for m in self.messages[-limit:]
        ]


class Alice(NetworkNode):
    """Alice node - generates quantum keys and sends secure messages"""
    
    def __init__(self, ip: str = "127.0.0.1", port: int = 8001):
        super().__init__("Alice", ip, port)
        self.quantum_key: Optional[List[int]] = None
        self.bb84_result: Optional[Dict] = None
        self.logger.info("👩 Alice is ready to generate quantum keys!")
    
    def generate_quantum_key(self, num_bits: int = 256, eve_active: bool = False) -> Dict:
        """
        Alice generates a quantum key using BB84 protocol
        
        Returns:
            Dictionary with key and session information
        """
        self.logger.info(f"🔐 Alice generating quantum key with {num_bits} qubits...")
        
        # Initialize BB84 protocol
        bb84 = BB84Protocol(num_bits=num_bits)
        
        # Run the protocol
        result = bb84.run_full_protocol(eve_active=eve_active, verbose=False)
        
        # Store the key
        self.quantum_key = bb84.get_secret_key()
        self.bb84_result = result
        
        if result["detected"]:
            self.logger.warning("⚠️ EAVESDROPPING DETECTED! Key may be compromised!")
        else:
            self.logger.info(f"✅ Quantum key generated! Length: {len(self.quantum_key)} bits")
        
        return result
    
    def send_secure_message(self, bob: 'Bob', message: str) -> Optional[Message]:
        """
        Alice sends an encrypted message to Bob using quantum key
        
        Args:
            bob: Bob node
            message: Message to send
        
        Returns:
            Message object or None if no quantum key
        """
        if not self.quantum_key:
            self.logger.error("❌ No quantum key available! Run generate_quantum_key first.")
            return None
        
        # Convert quantum key to string
        key_str = ''.join(str(bit) for bit in self.quantum_key)
        
        # XOR encryption (simple for demo)
        encrypted_chars = []
        for i, char in enumerate(message):
            key_bit = int(key_str[i % len(key_str)])
            encrypted_chars.append(chr(ord(char) ^ key_bit))
        encrypted = ''.join(encrypted_chars)
        
        # Send encrypted message
        msg = self.send_message(bob.name, encrypted, encrypted=True)
        
        if msg:
            # Bob decrypts automatically
            bob.receive_secure_message(msg, self.quantum_key)
        
        return msg
    
    def get_key_preview(self) -> str:
        """Get preview of quantum key"""
        if not self.quantum_key:
            return "No key generated"
        return ''.join(str(bit) for bit in self.quantum_key[:32]) + "..."
    
    def get_key_hex(self) -> str:
        """Get quantum key as hex string"""
        if not self.quantum_key:
            return "No key"
        key_str = ''.join(str(bit) for bit in self.quantum_key)
        # Ensure length is multiple of 4
        if len(key_str) % 4 != 0:
            key_str = key_str.ljust(len(key_str) + (4 - len(key_str) % 4), '0')
        return hex(int(key_str, 2))[2:].upper()


class Bob(NetworkNode):
    """Bob node - receives quantum keys and decrypts messages"""
    
    def __init__(self, ip: str = "127.0.0.1", port: int = 8002):
        super().__init__("Bob", ip, port)
        self.quantum_key: Optional[List[int]] = None
        self.decrypted_messages: List[Dict] = []
        self.logger.info("👨 Bob is ready to receive quantum keys!")
    
    def receive_quantum_key(self, key: List[int]) -> None:
        """Bob receives quantum key from Alice (via BB84 protocol)"""
        self.quantum_key = key
        self.logger.info(f"🔑 Bob received quantum key! Length: {len(key)} bits")
    
    def receive_secure_message(self, message: Message, key: List[int]) -> Optional[str]:
        """
        Bob decrypts a secure message using quantum key
        
        Args:
            message: Encrypted message
            key: Quantum key for decryption
        
        Returns:
            Decrypted message or None if decryption fails
        """
        if not key:
            self.logger.error("❌ No quantum key available for decryption!")
            return None
        
        # Convert quantum key to string
        key_str = ''.join(str(bit) for bit in key)
        
        # XOR decryption
        decrypted_chars = []
        for i, char in enumerate(message.content):
            key_bit = int(key_str[i % len(key_str)])
            decrypted_chars.append(chr(ord(char) ^ key_bit))
        decrypted = ''.join(decrypted_chars)
        
        # Store decrypted message
        self.decrypted_messages.append({
            "id": message.id,
            "sender": message.sender,
            "encrypted": message.content,
            "decrypted": decrypted,
            "timestamp": message.timestamp
        })
        
        self.logger.info(f"🔓 Bob decrypted message: {decrypted}")
        
        return decrypted
    
    def get_decrypted_messages(self, limit: int = 10) -> List[Dict]:
        """Get decrypted messages"""
        return self.decrypted_messages[-limit:]
    
    def get_key_preview(self) -> str:
        """Get preview of quantum key"""
        if not self.quantum_key:
            return "No key received"
        return ''.join(str(bit) for bit in self.quantum_key[:32]) + "..."


class Eve(NetworkNode):
    """Eve node - eavesdropper who tries to intercept quantum keys"""
    
    def __init__(self, ip: str = "127.0.0.1", port: int = 8003):
        super().__init__("Eve", ip, port)
        self.is_active = False
        self.attack_type: Optional[str] = None
        self.attack_logs: List[Dict] = []
        self.intercepted_keys: List[List[int]] = []
        self.logger.info("👩‍💻 Eve is ready to eavesdrop!")
    
    def activate(self, attack_type: str = "intercept_resend") -> None:
        """Activate Eve's eavesdropping"""
        self.is_active = True
        self.attack_type = attack_type
        self.logger.warning(f"⚠️ EVE ACTIVATED! Attack type: {attack_type}")
    
    def deactivate(self) -> None:
        """Deactivate Eve's eavesdropping"""
        self.is_active = False
        self.attack_type = None
        self.logger.info("✅ Eve deactivated")
    
    def intercept_quantum_key(self, bb84: BB84Protocol) -> Dict:
        """
        Eve intercepts the quantum transmission
        
        Args:
            bb84: BB84Protocol instance
            
        Returns:
            Dictionary with interception results
        """
        if not self.is_active:
            self.logger.info("Eve is not active. No interception.")
            return {"intercepted": False}
        
        self.logger.warning("👾 EVE IS INTERCEPTING THE QUANTUM TRANSMISSION!")
        
        # Eve measures qubits with random bases
        self.eve_bases = [random.randint(0, 1) for _ in range(len(bb84.alice_bits))]
        eve_results = []
        
        for i in range(len(bb84.alice_bits)):
            if self.eve_bases[i] == bb84.alice_bases[i]:
                eve_results.append(bb84.alice_bits[i])
            else:
                eve_results.append(random.randint(0, 1))
        
        # Log the attack
        attack_log = {
            "timestamp": datetime.now().isoformat(),
            "attack_type": self.attack_type or "intercept_resend",
            "eve_bases": self.eve_bases[:10] + ["..."] if len(self.eve_bases) > 10 else self.eve_bases,
            "eve_results": eve_results[:10] + ["..."] if len(eve_results) > 10 else eve_results
        }
        self.attack_logs.append(attack_log)
        
        # Store intercepted key (if Eve matched bases)
        intercepted_key = []
        for i in range(len(eve_results)):
            if self.eve_bases[i] == bb84.alice_bases[i]:
                intercepted_key.append(eve_results[i])
        
        if intercepted_key:
            self.intercepted_keys.append(intercepted_key)
            self.logger.warning(f"👾 Eve intercepted {len(intercepted_key)} key bits!")
        
        return {
            "intercepted": True,
            "attack_type": self.attack_type,
            "bits_intercepted": len(intercepted_key),
            "error_rate": bb84.error_rate if bb84.error_rate else 0.15  # Eve introduces ~15% error
        }
    
    def get_attack_stats(self) -> Dict:
        """Get Eve's attack statistics"""
        return {
            "is_active": self.is_active,
            "attack_type": self.attack_type,
            "total_attacks": len(self.attack_logs),
            "total_keys_intercepted": len(self.intercepted_keys),
            "last_attack": self.attack_logs[-1] if self.attack_logs else None
        }