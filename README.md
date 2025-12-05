# FeliStore

Plataforma de e-commerce Web3 híbrida (React + Node.js) con sistema de fidelización mediante tokens ERC-20 (Felicoins)

## Monorepo Structure

This is a monorepo containing the following workspaces:

- **`/frontend`**: React application built with Vite
- **`/backend`**: Node.js Express API server
- **`/blockchain`**: Hardhat smart contracts (Solidity)
- **`/specs`**: Technical documentation

## Getting Started

Install dependencies for all workspaces:
```bash
npm install
```

### Frontend
```bash
cd frontend
npm run dev
```

### Backend
```bash
cd backend
npm run dev
```

### Blockchain
```bash
cd blockchain
npm run compile
npm test
```

## Features

- 🌐 Web3 marketplace with hybrid architecture
- 💰 ERC-20 loyalty token (Felicoin)
- ⚡ Fast development with Vite
- 🔗 Smart contract integration with Hardhat
- 🚀 RESTful API backend

## Technology Stack

- **Frontend**: React, Vite
- **Backend**: Node.js, Express
- **Blockchain**: Solidity, Hardhat, OpenZeppelin
- **Package Management**: npm workspaces
