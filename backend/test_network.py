"""
Test script for Network Simulator
"""

from app.network.simulator import NetworkSimulator

def test_network():
    """Test network simulator"""
    print("\n" + "=" * 60)
    print("🧪 Testing Network Simulator")
    print("=" * 60)
    
    # Initialize simulator
    sim = NetworkSimulator()
    
    # Run demo
    results = sim.run_demo()
    
    print("\n📊 Results Summary:")
    print(f"  ✅ QKD Sessions: {len(results['qkd'])}")
    print(f"  ✅ Secure Messages: {len(results['messages'])}")
    print(f"  ✅ Attacks Simulated: {len(results['attacks'])}")
    
    # Get final status
    status = sim.get_network_status()
    print("\n📊 Final Network Status:")
    print(f"  🔑 Quantum Key: {'Yes' if status['nodes']['alice']['has_key'] else 'No'}")
    print(f"  📊 Security Score: {status['kpi']['security_score']}%")
    print(f"  🛡️  Attacks Detected: {status['kpi']['total_attacks_detected']}")
    print(f"  📨 Messages Sent: {status['kpi']['total_secure_messages']}")
    
    print("\n" + "=" * 60)
    print("✅ Network Simulator Test Complete!")
    
    return sim

if __name__ == "__main__":
    test_network()