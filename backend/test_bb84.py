"""
Simple test script for BB84 protocol
"""

from app.quantum_engine.bb84 import BB84Protocol

print("Testing BB84 Protocol...")
print()

# Test 1: 256 qubits, no Eve
print("Test 1: 256 qubits, no Eve")
bb84_1 = BB84Protocol(num_bits=256)
result_1 = bb84_1.run_full_protocol(eve_active=False, verbose=True)

print("\n" + "-" * 40)

# Test 2: 512 qubits, with Eve
print("Test 2: 512 qubits, with Eve")
bb84_2 = BB84Protocol(num_bits=512)
result_2 = bb84_2.run_full_protocol(eve_active=True, verbose=True)

print("\n✅ Done!")