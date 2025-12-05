# FeliStore Architecture

## Overview

FeliStore is a Web3 hybrid e-commerce platform with an ERC-20 token-based loyalty system. The project uses a monorepo structure managed by npm workspaces.

## Project Structure

```
FeliStore/
├── frontend/          # React application (Vite)
├── backend/           # Node.js Express API
├── blockchain/        # Solidity smart contracts (Hardhat)
├── specs/            # Technical documentation
└── package.json      # Root workspace configuration
```

## Components

### Frontend (`/frontend`)

- **Technology**: React 19 + Vite
- **Purpose**: User interface for the marketplace
- **Key Features**:
  - Fast development with Vite's HMR
  - Modern React setup
  - ESLint configuration for code quality
  
**Scripts**:
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build

### Backend (`/backend`)

- **Technology**: Node.js + Express
- **Purpose**: RESTful API server
- **Key Features**:
  - CORS enabled for frontend communication
  - Environment variable configuration
  - Health check endpoint
  
**Scripts**:
- `npm run dev` - Start development server
- `npm start` - Start production server

**Endpoints**:
- `GET /` - Welcome message
- `GET /health` - Health check

### Blockchain (`/blockchain`)

- **Technology**: Solidity 0.8.20 + Hardhat
- **Purpose**: Smart contract development and deployment
- **Key Features**:
  - Felicoin ERC-20 token implementation
  - OpenZeppelin contracts integration
  - Comprehensive test suite
  
**Scripts**:
- `npm run compile` - Compile smart contracts
- `npm run test` - Run contract tests
- `npm run deploy` - Deploy contracts
- `npm run node` - Start local Hardhat node

**Contracts**:
- `Felicoin.sol` - ERC-20 loyalty token with minting capabilities

## Development Workflow

### Getting Started

1. Install all dependencies:
```bash
npm install
```

2. Start individual workspaces:
```bash
# Frontend
cd frontend && npm run dev

# Backend
cd backend && npm run dev

# Blockchain
cd blockchain && npm run node
```

### Workspace Commands

Run commands across all workspaces:
```bash
npm run dev --workspaces      # Start all dev servers
npm run build --workspaces    # Build all projects
npm run test --workspaces     # Run all tests
```

## Technology Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React, Vite |
| Backend | Node.js, Express |
| Blockchain | Solidity, Hardhat, OpenZeppelin |
| Package Manager | npm workspaces |

## Future Enhancements

- Web3 wallet integration
- Smart contract interaction layer
- Token reward distribution system
- Product marketplace features
- User authentication and authorization
