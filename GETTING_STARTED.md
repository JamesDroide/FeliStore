# Getting Started with FeliStore

Welcome to FeliStore! This guide will help you set up and run the project locally.

## Prerequisites

- Node.js (v18 or higher)
- npm (v9 or higher)
- Git

## Installation

1. Clone the repository:
```bash
git clone https://github.com/JamesDroide/FeliStore.git
cd FeliStore
```

2. Install dependencies for all workspaces:
```bash
npm install
```

This will install dependencies for all three workspaces (frontend, backend, and blockchain).

## Running the Project

### Option 1: Run Everything Separately

Open three terminal windows and run:

**Terminal 1 - Frontend:**
```bash
cd frontend
npm run dev
```
The frontend will be available at `http://localhost:5173`

**Terminal 2 - Backend:**
```bash
cd backend
npm run dev
```
The backend API will be available at `http://localhost:3000`

**Terminal 3 - Blockchain (optional):**
```bash
cd blockchain
npm run node
```
This starts a local Hardhat node for smart contract development.

### Option 2: Run All Workspaces at Once

```bash
npm run dev --workspaces
```

## Development

### Frontend Development

The frontend is a React application built with Vite.

```bash
cd frontend
npm run dev      # Start dev server
npm run build    # Build for production
npm run lint     # Run ESLint
npm run preview  # Preview production build
```

### Backend Development

The backend is a Node.js Express API server.

```bash
cd backend
npm run dev      # Start dev server
npm start        # Start production server
```

**Testing the API:**
```bash
curl http://localhost:3000/
curl http://localhost:3000/health
```

### Blockchain Development

Smart contracts are developed using Hardhat and Solidity.

```bash
cd blockchain
npm run compile  # Compile contracts
npm run test     # Run tests
npm run node     # Start local blockchain
npm run deploy   # Deploy contracts
```

## Project Structure

```
FeliStore/
├── frontend/          # React + Vite
│   ├── src/          # Source code
│   ├── public/       # Static assets
│   └── package.json
├── backend/           # Express API
│   ├── src/          # Source code
│   └── package.json
├── blockchain/        # Smart contracts
│   ├── contracts/    # Solidity contracts
│   ├── scripts/      # Deployment scripts
│   ├── test/         # Contract tests
│   └── package.json
├── specs/            # Documentation
└── package.json      # Root workspace config
```

## Environment Variables

### Backend
Create a `.env` file in the `backend` directory:
```
PORT=3000
NODE_ENV=development
```

## Building for Production

Build all workspaces:
```bash
npm run build --workspaces
```

Or build individually:
```bash
cd frontend && npm run build
cd backend && npm run build  # (if build script is added)
cd blockchain && npm run compile
```

## Testing

Run tests for all workspaces:
```bash
npm test --workspaces --if-present
```

Or test individually:
```bash
cd blockchain && npm test
```

## Key Features

- 🌐 **Web3 Integration**: Ready for blockchain connectivity
- 💰 **Felicoin Token**: ERC-20 loyalty token
- ⚡ **Fast Development**: Vite HMR for React
- 🔗 **API Ready**: RESTful backend with Express
- 📦 **Monorepo**: npm workspaces for easy management

## Next Steps

1. Explore the codebase
2. Read the architecture documentation in `specs/architecture.md`
3. Start building your marketplace features!
4. Integrate Web3 wallet connectivity
5. Connect frontend to backend API
6. Deploy smart contracts to testnet

## Troubleshooting

**Port already in use:**
- Change the port in `.env` for backend
- Vite will automatically use another port for frontend

**Dependencies not installing:**
- Clear npm cache: `npm cache clean --force`
- Delete `node_modules` and `package-lock.json`, then reinstall

**Smart contracts not compiling:**
- Ensure you have internet connection for downloading Solidity compiler
- Check Hardhat configuration in `blockchain/hardhat.config.js`

## Support

For issues or questions, please open an issue on GitHub.

Happy coding! 🚀
