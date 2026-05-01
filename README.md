# QSEC — Quantum-Secure Ephemeral Chat

**QSEC** is a high-assurance, ephemeral chat application built to withstand the threat of quantum computing. It implements **ML-KEM-768 (FIPS 203)**, the world’s first standardized post-quantum cryptographic algorithm, ensuring that your private conversations remain secure even against future adversaries armed with powerful quantum computers.

---

## 🛡️ Core Philosophy

### 1. Quantum Resilience
Current public-key infrastructure (RSA, ECC) is vulnerable to **Shor’s Algorithm**. QSEC uses Lattice-Based Cryptography to prevent "Harvest Now, Decrypt Later" (HNDL) attacks.

### 2. Zero-Knowledge Architecture
All cryptographic operations happen exclusively in the browser using the WebCrypto API and `@noble/post-quantum`. The server is a "dumb" relay; it never sees plaintext, private keys, or shared secrets.

### 3. Ephemeral by Design
QSEC has no database. Chat history exists only in the server's volatile memory and is wiped the moment the room is empty. Refreshing the page destroys all ephemeral session keys.

---

## ✨ Key Features

- **ML-KEM-768 Handshake:** Secure key encapsulation mechanism (formerly CRYSTALS-Kyber) for establishing shared secrets.
- **AES-256-GCM Encryption:** Every message is encrypted with authenticated symmetric crypto using a fresh 12-byte IV.
- **🔍 Encryption Trace:** A unique pedagogical feature that allows you to inspect every byte of a message's journey—from plaintext, to UTF-8 encoding, to ciphertext, to the wire payload.
- **🧪 Interactive LWE Lab:** A built-in visualization tool that demonstrates the **Learning With Errors (LWE)** problem and the **Closest Vector Problem (CVP)** that underpins lattice security.
- **High-Fidelity UI:** A modern, dark-mode interface built with React, Tailwind CSS, and Framer Motion.

---

## 🚀 Tech Stack

- **Frontend:** React 18, TypeScript, Tailwind CSS, Framer Motion, Zustand.
- **Backend:** Python 3.10+, FastAPI, Uvicorn (WebSocket relay).
- **Cryptography:**
  - **PQC:** `@noble/post-quantum` (ML-KEM/FIPS 203).
  - **Symmetric:** WebCrypto API (AES-GCM, HKDF, SHA-256).
- **Transport:** Native WebSockets.

---

## 🛠️ Getting Started

### Prerequisites
- Node.js (v18+)
- Python 3.10+

### 1. Clone the Repository
```bash
git clone https://github.com/your-repo/qsec.git
cd qsec
```

### 2. Setup the Backend
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt  # Or pip install fastapi uvicorn
python main.py
```
The server will start at `ws://localhost:8000`.

### 3. Setup the Frontend
```bash
cd ../frontend
npm install
npm run dev
```
Open `http://localhost:5173` in your browser.

---

## 📐 Cryptographic Flow

1.  **Join:** Alice enters a room. She is assigned the `initiator` role.
2.  **Keygen:** Bob joins. Alice generates an ML-KEM-768 keypair and sends her **Public Key** to Bob.
3.  **Encapsulate:** Bob uses Alice's Public Key to generate a **Shared Secret** and a **Ciphertext**. He sends the Ciphertext back to Alice.
4.  **Decapsulate:** Alice uses her **Private Key** to derive the identical **Shared Secret** from Bob’s Ciphertext.
5.  **KDF:** Both parties pass the Shared Secret through **HKDF-SHA256** to derive a 256-bit AES key.
6.  **Chat:** All subsequent messages are encrypted with **AES-256-GCM**.

---

## 📚 References & Standards

- **FIPS 203:** [Module-Lattice-Based Key-Encapsulation Mechanism Standard](https://csrc.nist.gov/pubs/fips/203/final)
- **Regev (2005):** [On Lattices, Learning with Errors, and Cryptography](https://dl.acm.org/doi/10.1145/1568318.1568324)
- **NIST PQC:** [Post-Quantum Cryptography Standardization Project](https://csrc.nist.gov/projects/post-quantum-cryptography)

---

## 📄 License
This project is licensed under the MIT License - see the LICENSE file for details.
