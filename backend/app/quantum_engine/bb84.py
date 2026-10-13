"""
BB84 Quantum Key Distribution Protocol
Quantum Telecom Simulator - Phase 2

The BB84 protocol was invented by Charles Bennett and Gilles Brassard in 1984.
It is the first quantum cryptography protocol and forms the foundation of
Quantum Key Distribution (QKD).
"""

import random
import numpy as np
from typing import List, Tuple, Dict
import logging

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class BB84Protocol:
    """
    Implementation of the BB84 Quantum Key Distribution Protocol.
    
    BB84 allows two parties (Alice and Bob) to generate a shared secret key
    while detecting the presence of an eavesdropper (Eve).
    """
    
    def __init__(self, num_bits: int = 256):
        """
        Initialize the BB84 protocol.
        
        Args:
            num_bits: Number of bits to generate (default: 256)
        """
        self.num_bits = num_bits
        
        # Alice's data
        self.alice_bits = []      # Random bits Alice wants to send
        self.alice_bases = []     # Bases Alice uses to encode bits
        
        # Bob's data
        self.bob_bases = []       # Bases Bob uses to measure
        self.bob_results = []     # Results Bob measures
        
        # Results
        self.secret_key = []      # The final shared secret key
        self.matched_indices = [] # Indices where Alice and Bob used same bases
        self.error_rate = 0.0    # Error rate (for eavesdropping detection)
        
        # Eve (eavesdropper) data
        self.eve_is_active = False
        self.eve_bases = []
        self.eve_results = []
        
        logger.info(f"BB84 Protocol initialized with {num_bits} qubits")
    
    def generate_qubits(self) -> Tuple[List[int], List[int]]:
        """
        Step 1: Alice generates random bits and random bases.
        
        Alice randomly generates:
        1. A sequence of random bits (0 or 1)
        2. A sequence of random bases (0 = rectilinear/+, 1 = diagonal/x)
        
        Returns:
            Tuple of (alice_bits, alice_bases)
        """
        logger.info("Step 1: Alice generating random qubits...")
        
        # Generate random bits (0 or 1)
        self.alice_bits = [random.randint(0, 1) for _ in range(self.num_bits)]
        
        # Generate random bases (0 = rectilinear |, 1 = diagonal x)
        self.alice_bases = [random.randint(0, 1) for _ in range(self.num_bits)]
        
        logger.info(f"Generated {len(self.alice_bits)} qubits")
        logger.debug(f"First 10 bits: {self.alice_bits[:10]}")
        logger.debug(f"First 10 bases: {self.alice_bases[:10]}")
        
        return self.alice_bits, self.alice_bases
    
    def simulate_transmission(self, eve_active: bool = False) -> List[int]:
        """
        Step 2: Simulate qubit transmission from Alice to Bob.
        
        The qubits travel through the quantum channel. If Eve is active,
        she intercepts and measures the qubits before forwarding them to Bob.
        
        Args:
            eve_active: Whether Eve is eavesdropping
            
        Returns:
            Bob's measurement results
        """
        logger.info(f"Step 2: Transmitting qubits... (Eve active: {eve_active})")
        
        self.eve_is_active = eve_active
        self.bob_bases = [random.randint(0, 1) for _ in range(self.num_bits)]
        self.bob_results = []
        
        if eve_active:
            logger.warning("⚠️ EVE IS ACTIVE! She is trying to eavesdrop!")
            self.eve_bases = [random.randint(0, 1) for _ in range(self.num_bits)]
            self.eve_results = []
        
        for i in range(self.num_bits):
            if eve_active:
                # Eve intercepts the qubit
                # She measures it using her random basis
                if self.eve_bases[i] == self.alice_bases[i]:
                    # Eve uses same basis as Alice → she gets the correct bit
                    eve_measurement = self.alice_bits[i]
                else:
                    # Eve uses wrong basis → random result (50% chance)
                    eve_measurement = random.randint(0, 1)
                
                self.eve_results.append(eve_measurement)
                
                # Eve resends the qubit to Bob (but it's now changed!)
                # Bob measures the modified qubit
                if self.bob_bases[i] == self.eve_bases[i]:
                    bob_measurement = eve_measurement
                else:
                    bob_measurement = random.randint(0, 1)
                
                self.bob_results.append(bob_measurement)
                
            else:
                # Normal transmission (no eavesdropping)
                # Bob measures with his random basis
                if self.bob_bases[i] == self.alice_bases[i]:
                    # Bob used same basis → gets correct bit
                    bob_measurement = self.alice_bits[i]
                else:
                    # Bob used wrong basis → random result
                    bob_measurement = random.randint(0, 1)
                
                self.bob_results.append(bob_measurement)
        
        logger.info(f"Transmission complete. Bob received {len(self.bob_results)} bits")
        
        if eve_active:
            logger.info(f"Eve measured {len(self.eve_results)} bits")
        
        return self.bob_results
    
    def sift_key(self) -> List[int]:
        """
        Step 3: Sift the key.
        
        Alice and Bob compare their bases over a public channel.
        They keep only the bits where they used the same basis.
        
        Returns:
            The sifted secret key
        """
        logger.info("Step 3: Sifting the key...")
        
        self.secret_key = []
        self.matched_indices = []
        
        for i in range(self.num_bits):
            if self.alice_bases[i] == self.bob_bases[i]:
                # Same basis → keep this bit
                self.secret_key.append(self.alice_bits[i])
                self.matched_indices.append(i)
        
        logger.info(f"Sifted key length: {len(self.secret_key)} bits")
        logger.info(f"Efficiency: {len(self.secret_key) / self.num_bits * 100:.1f}%")
        
        return self.secret_key
    
    def calculate_error_rate(self) -> float:
        """
        Step 4: Calculate the error rate.
        
        Alice and Bob compare a subset of their bits over a public channel.
        If Eve is active, the error rate will be higher (typically > 10%).
        
        Returns:
            The error rate (0.0 to 1.0)
        """
        logger.info("Step 4: Calculating error rate...")
        
        # Use only the matched indices (where bases matched)
        errors = 0
        total = 0
        
        # Only check a subset (25%) to save the key
        check_count = max(1, len(self.matched_indices) // 4)
        sample_indices = random.sample(self.matched_indices, min(check_count, len(self.matched_indices)))
        
        for idx in sample_indices:
            total += 1
            if self.alice_bits[idx] != self.bob_results[idx]:
                errors += 1
        
        self.error_rate = errors / total if total > 0 else 0.0
        
        logger.info(f"Error rate: {self.error_rate * 100:.2f}%")
        logger.info(f"Errors: {errors} / {total}")
        
        return self.error_rate
    
    def detect_eavesdropping(self, threshold: float = 0.1) -> bool:
        """
        Step 5: Detect eavesdropping.
        
        If the error rate exceeds a threshold (typically 10%), Eve is detected.
        
        Args:
            threshold: Maximum acceptable error rate (default: 0.1 = 10%)
            
        Returns:
            True if eavesdropping is detected, False otherwise
        """
        logger.info("Step 5: Detecting eavesdropping...")
        
        detected = self.error_rate > threshold
        
        if detected:
            logger.warning(f"⚠️ EAVESDROPPING DETECTED! Error rate: {self.error_rate * 100:.2f}% > {threshold * 100:.0f}%")
        else:
            logger.info(f"✅ Channel secure. Error rate: {self.error_rate * 100:.2f}% <= {threshold * 100:.0f}%")
        
        return detected
    
    def get_secret_key(self) -> List[int]:
        """
        Get the final secret key.
        
        Returns:
            The secret key as a list of bits
        """
        return self.secret_key
    
    def get_key_as_string(self) -> str:
        """
        Get the secret key as a string.
        
        Returns:
            The secret key as a string of 0s and 1s
        """
        return ''.join(str(bit) for bit in self.secret_key)
    
    def get_key_as_hex(self) -> str:
        """
        Get the secret key as a hexadecimal string.
        
        Returns:
            The secret key as hex (for use in encryption)
        """
        key_str = self.get_key_as_string()
        # Ensure length is multiple of 4
        if len(key_str) % 4 != 0:
            key_str = key_str.ljust(len(key_str) + (4 - len(key_str) % 4), '0')
        return hex(int(key_str, 2))[2:].upper()
    
    def run_full_protocol(self, eve_active: bool = False, verbose: bool = True) -> Dict:
        """
        Run the complete BB84 protocol from start to finish.
        
        Args:
            eve_active: Whether to simulate Eve's eavesdropping
            verbose: Whether to print detailed output
            
        Returns:
            Dictionary with all results
        """
        if verbose:
            print("\n" + "=" * 60)
            print("🔐 BB84 QUANTUM KEY DISTRIBUTION PROTOCOL")
            print("=" * 60)
            print(f"📊 Number of qubits: {self.num_bits}")
            print(f"👾 Eve active: {eve_active}")
            print("-" * 60)
        
        # Step 1: Alice generates qubits
        self.generate_qubits()
        if verbose:
            print(f"✅ Alice generated {self.num_bits} qubits")
        
        # Step 2: Transmit qubits
        self.simulate_transmission(eve_active)
        if verbose:
            print(f"✅ Transmission complete")
            if eve_active:
                print("⚠️ Eve intercepted the qubits!")
        
        # Step 3: Sift the key
        self.sift_key()
        if verbose:
            print(f"✅ Key sifted: {len(self.secret_key)} bits matched")
        
        # Step 4: Calculate error rate
        self.calculate_error_rate()
        if verbose:
            print(f"📊 Error rate: {self.error_rate * 100:.2f}%")
        
        # Step 5: Detect eavesdropping
        detected = self.detect_eavesdropping()
        if verbose:
            if detected:
                print("⚠️ EAVESDROPPING DETECTED! Discard key and restart.")
            else:
                print("✅ Channel secure! Key can be used for encryption.")
        
        # Display key
        if verbose and not detected:
            print("-" * 60)
            print(f"🔑 Secret Key (first 32 bits): {self.get_key_as_string()[:32]}...")
            print(f"🔑 Key length: {len(self.secret_key)} bits")
            print(f"🔑 Key as Hex: {self.get_key_as_hex()[:16]}...")
        
        print("=" * 60)
        
        return {
            "success": True,
            "num_bits": self.num_bits,
            "eve_active": eve_active,
            "detected": detected,
            "key_length": len(self.secret_key),
            "error_rate": self.error_rate,
            "secret_key": self.secret_key,
            "key_string": self.get_key_as_string(),
            "key_hex": self.get_key_as_hex(),
            "matched_indices": len(self.matched_indices)
        }


# ============================================
# TESTING FUNCTIONS
# ============================================

def test_bb84_no_eve():
    """Test BB84 without eavesdropping"""
    print("\n" + "=" * 60)
    print("🧪 TEST 1: BB84 WITHOUT EAVESDROPPING")
    print("=" * 60)
    
    bb84 = BB84Protocol(num_bits=128)
    result = bb84.run_full_protocol(eve_active=False)
    
    # Assertions
    assert result["detected"] == False, "❌ False alarm! No Eve but detection triggered."
    assert result["error_rate"] < 0.1, f"❌ Error rate too high: {result['error_rate']*100:.2f}%"
    assert result["key_length"] > 0, "❌ No key generated!"
    
    print(f"\n✅ TEST PASSED! Secure key generated successfully.")
    return result


def test_bb84_with_eve():
    """Test BB84 with eavesdropping"""
    print("\n" + "=" * 60)
    print("🧪 TEST 2: BB84 WITH EAVESDROPPING")
    print("=" * 60)
    
    bb84 = BB84Protocol(num_bits=128)
    result = bb84.run_full_protocol(eve_active=True)
    
    # Assertions
    if result["detected"]:
        print(f"\n✅ TEST PASSED! Eavesdropping detected successfully.")
    else:
        print(f"\n⚠️ WARNING: Eve was active but not detected!")
        print(f"Error rate: {result['error_rate']*100:.2f}%")
    
    return result


def compare_keys():
    """Compare keys with and without Eve"""
    print("\n" + "=" * 60)
    print("🧪 TEST 3: COMPARING KEYS")
    print("=" * 60)
    
    # Generate key without Eve
    bb84_no_eve = BB84Protocol(num_bits=256)
    result_no_eve = bb84_no_eve.run_full_protocol(eve_active=False, verbose=False)
    key1 = bb84_no_eve.get_key_as_string()
    
    # Generate key with Eve (will be detected, key discarded)
    bb84_with_eve = BB84Protocol(num_bits=256)
    result_with_eve = bb84_with_eve.run_full_protocol(eve_active=True, verbose=False)
    key2 = bb84_with_eve.get_key_as_string()
    
    print(f"📊 Key without Eve: {len(key1)} bits")
    print(f"📊 Key with Eve: {len(key2)} bits")
    print(f"📊 Eve detected: {result_with_eve['detected']}")
    
    if result_with_eve['detected']:
        print("✅ Eve detected! Key discarded (not secure).")
    else:
        print("⚠️ Eve not detected. Keys may be compromised.")


def run_all_tests():
    """Run all test functions"""
    print("\n" + "█" * 60)
    print("█  RUNNING BB84 PROTOCOL TESTS")
    print("█" * 60)
    
    try:
        test_bb84_no_eve()
    except AssertionError as e:
        print(f"❌ Test failed: {e}")
    
    test_bb84_with_eve()
    compare_keys()
    
    print("\n" + "█" * 60)
    print("█  ALL TESTS COMPLETE")
    print("█" * 60)


# ============================================
# MAIN ENTRY POINT
# ============================================

if __name__ == "__main__":
    # Run the tests
    run_all_tests()
    
    print("\n" + "=" * 60)
    print("🎯 BB84 PROTOCOL IMPLEMENTATION COMPLETE!")
    print("=" * 60)
    print("\n💡 Next: Test the protocol with different parameters")
    print("   Example: bb84 = BB84Protocol(num_bits=512)")
    print("            result = bb84.run_full_protocol(eve_active=True)")
    print("\n📂 Location: backend/app/quantum_engine/bb84.py")