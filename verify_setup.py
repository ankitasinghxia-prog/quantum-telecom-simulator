#!/usr/bin/env python
"""
Verify all installations are working
Quantum Telecom Simulator - Phase 1
"""

import sys
import subprocess

def check_python():
    """Check Python version"""
    version = sys.version_info
    print(f"✅ Python {version.major}.{version.minor}.{version.micro}")
    if version.major < 3 or (version.major == 3 and version.minor < 10):
        print("⚠️ Python 3.10+ required!")
        return False
    return True

def check_packages():
    """Check required packages are installed"""
    required = ['qiskit', 'fastapi', 'uvicorn']
    missing = []
    
    for package in required:
        try:
            __import__(package)
            print(f"✅ {package} installed")
        except ImportError:
            missing.append(package)
            print(f"❌ {package} missing")
    
    if missing:
        print(f"\n⚠️ Install missing packages: pip install {' '.join(missing)}")
        return False
    return True

def check_node():
    """Check Node.js is installed"""
    try:
        result = subprocess.run(['node', '--version'], capture_output=True, text=True)
        print(f"✅ Node.js {result.stdout.strip()}")
        return True
    except:
        print("❌ Node.js not found! Install from nodejs.org")
        return False

def check_npm():
    """Check npm is installed"""
    try:
        result = subprocess.run(['npm', '--version'], capture_output=True, text=True)
        print(f"✅ npm {result.stdout.strip()}")
        return True
    except:
        print("❌ npm not found!")
        return False

if __name__ == "__main__":
    print("\n🔍 Verifying Quantum Telecom Simulator Setup")
    print("=" * 50)
    
    checks = [
        check_python(),
        check_packages(),
        check_node(),
        check_npm()
    ]
    
    print("\n" + "=" * 50)
    if all(checks):
        print("✅ All checks passed! Ready for Phase 2 🚀")
        print("\n💡 Next: Implement BB84 Protocol")
        print("📂 Location: backend/app/quantum_engine/bb84.py")
    else:
        print("⚠️ Some checks failed. Fix issues before proceeding.")