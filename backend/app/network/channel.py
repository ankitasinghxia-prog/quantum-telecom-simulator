"""
Quantum Channel Simulation for Network Communication
"""

import logging
import random
from datetime import datetime
from typing import Optional, Dict, Any, List
from dataclasses import dataclass

# IMPORTANT: Import NetworkNode from nodes.py
from .nodes import Alice, Bob, Eve, Message, NetworkNode

logger = logging.getLogger(__name__)


@dataclass
class ChannelStats:
    """Channel statistics"""
    messages_sent: int = 0
    messages_received: int = 0
    packets_lost: int = 0
    error_rate: float = 0.0
    latency_avg: float = 0.0
    last_activity: Optional[str] = None


class QuantumChannel:
    """
    Simulated quantum channel for secure communication
    
    Handles:
    - Message transmission between Alice and Bob
    - Eve's eavesdropping
    - Packet loss simulation
    - Latency simulation
    """
    
    def __init__(self, name: str = "Quantum Channel", packet_loss: float = 0.01, latency: float = 0.05):
        """
        Initialize quantum channel
        
        Args:
            name: Channel name
            packet_loss: Probability of packet loss (0.0 to 1.0)
            latency: Average latency in seconds
        """
        self.name = name
        self.packet_loss = packet_loss
        self.latency = latency
        self.is_secure = True
        self.alice: Optional[Alice] = None
        self.bob: Optional[Bob] = None
        self.eve: Optional[Eve] = None
        self.stats = ChannelStats()
        self.message_history: List[Dict] = []
        
        logger.info(f"✅ {name} initialized (packet_loss: {packet_loss*100}%, latency: {latency}s)")
    
    def connect_nodes(self, alice: Alice, bob: Bob, eve: Optional[Eve] = None) -> None:
        """Connect nodes to the channel"""
        self.alice = alice
        self.bob = bob
        self.eve = eve
        
        # Create connections
        alice.connect_to(bob)
        bob.connect_to(alice)
        
        if eve:
            eve.connect_to(alice)
            eve.connect_to(bob)
            logger.info("⚠️ Eve is connected to the channel!")
        
        logger.info(f"✅ Nodes connected: {alice.name} <-> {bob.name}")
    
    def transmit_message(self, sender: NetworkNode, recipient: NetworkNode, content: str, encrypted: bool = False) -> Optional[Dict]:
        """
        Transmit a message through the channel
        
        Args:
            sender: Sender node
            recipient: Recipient node
            content: Message content
            encrypted: Whether message is encrypted
        
        Returns:
            Message data or None if packet lost
        """
        # Check if nodes are connected
        if recipient.name not in sender.connected_nodes:
            logger.error(f"❌ {sender.name} is not connected to {recipient.name}")
            return None
        
        # Simulate packet loss
        if random.random() < self.packet_loss:
            self.stats.packets_lost += 1
            logger.warning(f"⚠️ Packet lost! ({sender.name} -> {recipient.name})")
            return None
        
        # Simulate latency
        if self.latency > 0:
            import time
            actual_latency = self.latency * (0.5 + random.random())  # Variable latency
            # time.sleep(actual_latency)  # Uncomment for real latency simulation
            self.stats.latency_avg = (self.stats.latency_avg + actual_latency) / 2
        
        # Create message
        message = sender.send_message(recipient.name, content, encrypted)
        
        if message:
            self.stats.messages_sent += 1
            self.stats.last_activity = datetime.now().isoformat()
            
            # Receive message
            if recipient.receive_message(message):
                self.stats.messages_received += 1
                
                # Log message
                msg_data = {
                    "id": message.id,
                    "sender": sender.name,
                    "recipient": recipient.name,
                    "content": content,
                    "encrypted": encrypted,
                    "timestamp": message.timestamp,
                    "status": message.status
                }
                self.message_history.append(msg_data)
                
                # If Eve is active, she eavesdrops
                if self.eve and self.eve.is_active:
                    self._eve_eavesdrop(message)
                
                return msg_data
        
        return None
    
    def _eve_eavesdrop(self, message: Message) -> None:
        """Eve eavesdrops on the message"""
        if not self.eve or not self.eve.is_active:
            return
        
        logger.warning(f"👾 Eve is eavesdropping on message from {message.sender} to {message.recipient}")
        
        # Eve copies the message
        eve_msg = Message(
            id=f"eve_{message.id}",
            sender="Eve",
            recipient="Eve_Storage",
            content=message.content,
            encrypted=message.encrypted,
            timestamp=datetime.now().isoformat(),
            status="intercepted"
        )
        
        # Eve's attack log
        attack_log = {
            "message_id": message.id,
            "sender": message.sender,
            "recipient": message.recipient,
            "timestamp": datetime.now().isoformat(),
            "type": "message_interception"
        }
        
        self.eve.attack_logs.append(attack_log)
        self.stats.error_rate = min(1.0, self.stats.error_rate + 0.02)  # Eve increases error rate
    
    def get_stats(self) -> Dict:
        """Get channel statistics"""
        return {
            "name": self.name,
            "is_secure": self.is_secure,
            "packet_loss": self.packet_loss,
            "latency": self.latency,
            "stats": {
                "messages_sent": self.stats.messages_sent,
                "messages_received": self.stats.messages_received,
                "packets_lost": self.stats.packets_lost,
                "error_rate": self.stats.error_rate,
                "latency_avg": self.stats.latency_avg,
                "last_activity": self.stats.last_activity
            },
            "message_history_count": len(self.message_history)
        }
    
    def get_message_history(self, limit: int = 20) -> List[Dict]:
        """Get message history"""
        return self.message_history[-limit:]
    
    def clear_history(self) -> None:
        """Clear message history"""
        self.message_history = []
        self.stats = ChannelStats()
        logger.info("Channel history cleared")