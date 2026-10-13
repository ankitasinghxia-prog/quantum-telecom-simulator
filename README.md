# 🔐 Quantum Cryptography-Based Secure Communication Network Simulator

A full-stack simulation framework demonstrating secure quantum communication using the **BB84 Quantum Key Distribution (QKD)** protocol, with real-time attack detection and 3D network visualization.

![Status](https://img.shields.io/badge/Status-Completed-brightgreen)
![Python](https://img.shields.io/badge/Python-3.11-blue)
![React](https://img.shields.io/badge/React-18.2-61DAFB)
![Qiskit](https://img.shields.io/badge/Qiskit-0.46-6929C4)

---

## 📖 Overview

This project was developed during a **6-week internship at Bharat Sanchar Nigam Limited (BSNL), Bareilly**. It simulates a quantum-secured telecom network with three nodes — **Alice** (sender), **Bob** (receiver), and **Eve** (eavesdropper) — and provides real-time visualization of quantum key generation, secure messaging, and attack detection.

### Key Features

- ⚛️ **BB84 Quantum Key Distribution** using IBM Qiskit
- 🔐 **Secure Communication** with quantum-encrypted messaging
- 👾 **Attack Detection** (Intercept-Resend, MITM, DoS, Photon Splitting)
- 🤖 **AI-Powered Anomaly Detection** and attack prediction
- 🌍 **3D Network Visualization** with Three.js
- 📊 **Real-time KPI Analytics** with WebSocket updates
- 🎨 **Interactive Dashboard** with Dark/Light theme

---

## 🛠️ Tech Stack

| Layer | Technologies |
|-------|-------------|
| Frontend | React.js, Tailwind CSS, Three.js, Recharts |
| Backend | Python 3.11, FastAPI, Uvicorn |
| Quantum | Qiskit, Qiskit Aer |
| Real-time | WebSocket |
| Storage | In-Memory (Python Dicts) |

---

## 📁 Project Structure

```
quantum-telecom-simulator/
├── backend/
│   ├── app/
│   │   ├── api/              REST API routes
│   │   ├── network/          Network simulator (Alice, Bob, Eve)
│   │   ├── quantum_engine/   BB84 protocol implementation
│   │   ├── database/         Data models
│   │   ├── main.py           FastAPI entry point
│   │   └── config.py         Configuration
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── components/       React components
│   │   ├── hooks/            Custom hooks
│   │   └── utils/            Utility functions
│   └── package.json
└── README.md
```

---

## 🚀 Installation & Setup

### Backend Setup

```bash
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```


---

## 🎯 How It Works

1. **Key Generation:** Alice generates random qubits and transmits them
2. **Measurement:** Bob measures qubits using random bases
3. **Key Sifting:** Matching bases form the secret key
4. **Error Detection:** Error rate > 10% means Eve is detected
5. **Secure Communication:** Messages encrypted with quantum key

---

## 📊 Results

| Attack Type | Detection Rate | Avg. Detection Time |
|-------------|----------------|---------------------|
| Intercept-Resend | 100% | 1.8s |
| Man-in-the-Middle | 100% | 2.1s |
| Denial of Service | 98% | 2.8s |
| Photon Splitting | 95% | 4.2s |



## 👩‍💻 Author

**Ankita Singh**
B.Tech (CSE), 3rd Year
Shri Ram Murti Smarak College of Engineering & Technology, Bareilly
Dr. A.P.J. Abdul Kalam Technical University, Lucknow

---

## 📄 License

This project is developed for educational and research purposes as part of the BSNL Internship Program.

---

## 🙏 Acknowledgments

- **BSNL Bareilly** for the internship opportunity
- **SRMS College** for academic support
- **IBM Qiskit** for the quantum computing framework