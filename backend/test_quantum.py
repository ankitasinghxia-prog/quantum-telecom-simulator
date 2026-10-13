"""
First Quantum Circuit Test
Quantum Telecom Simulator - Phase 1
"""

# NEW IMPORT STYLE (Qiskit 1.0+)
from qiskit import QuantumCircuit, transpile
from qiskit_aer import AerSimulator
from qiskit.visualization import plot_histogram
import matplotlib.pyplot as plt

print("🔬 Testing Quantum Computing Setup...")
print("=" * 40)

# Create a simple quantum circuit
circuit = QuantumCircuit(1, 1)

# Apply Hadamard gate to create superposition
circuit.h(0)

# Measure the qubit
circuit.measure(0, 0)

# Use the Qiskit Aer simulator (NEW WAY)
simulator = AerSimulator()

# Execute the circuit
job = simulator.run(circuit, shots=1024)
result = job.result()
counts = result.get_counts(circuit)

print("🎯 Quantum Circuit Results:")
print(f"Number of shots: 1024")
print(f"Results: {counts}")
print(f"Probability of 0: {counts.get('0', 0) / 1024 * 100:.1f}%")
print(f"Probability of 1: {counts.get('1', 0) / 1024 * 100:.1f}%")

print("\n✅ Quantum computing setup is working!")
print("\n💡 Next: Implement BB84 protocol in Phase 2")