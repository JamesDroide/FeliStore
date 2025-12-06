import { ethers } from 'ethers';
import dotenv from 'dotenv';

dotenv.config();

// Configuración de la red blockchain
export const BLOCKCHAIN_CONFIG = {
  network: process.env.BLOCKCHAIN_NETWORK || 'localhost',
  rpcUrl: process.env.RPC_URL || 'http://127.0.0.1:8545',
  chainId: parseInt(process.env.CHAIN_ID) || 31337,
};

// Provider para conectarse a la blockchain
export const provider = new ethers.JsonRpcProvider(BLOCKCHAIN_CONFIG.rpcUrl);

// Wallet del administrador (para pagar gas de operaciones)
export const adminWallet = process.env.ADMIN_PRIVATE_KEY
  ? new ethers.Wallet(process.env.ADMIN_PRIVATE_KEY, provider)
  : null;

// Direcciones de los contratos (actualizar después del deploy)
export const CONTRACTS = {
  FELICOIN: process.env.CONTRACT_FELICOIN || '0x5FbDB2315678afecb367f032d93F642f64180aa3',
  LOYALTY: process.env.CONTRACT_LOYALTY || '0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512',
  IDENTITY: process.env.CONTRACT_IDENTITY || '0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0',
  GOVERNOR: process.env.CONTRACT_GOVERNOR || '0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9',
  TICKET: process.env.CONTRACT_TICKET || '0xDc64a140Aa3E981100a9becA4E685f962f0cF6C9',
};

// ABIs de los contratos (versión simplificada - actualizar con ABIs completos después del deploy)
export const ABIS = {
  FELICOIN: [
    'function balanceOf(address owner) view returns (uint256)',
    'function transfer(address to, uint256 amount) returns (bool)',
    'event Transfer(address indexed from, address indexed to, uint256 value)'
  ],
  LOYALTY: [
    'function getCashback(address user) view returns (uint256)',
    'function getStakedAmount(address user) view returns (uint256)',
    'function stake(uint256 amount)',
    'function unstake(uint256 amount)',
    'event Staked(address indexed user, uint256 amount)',
    'event Unstaked(address indexed user, uint256 amount)',
    'event CashbackEarned(address indexed user, uint256 amount)'
  ],
  IDENTITY: [
    'function isVerified(address user) view returns (bool)',
    'function verifyIdentity(address user)',
    'event IdentityVerified(address indexed user, uint256 timestamp)'
  ],
  GOVERNOR: [
    'function propose(string memory description) returns (uint256)',
    'function vote(uint256 proposalId, bool support)',
    'function execute(uint256 proposalId)',
    'event ProposalCreated(uint256 proposalId, address proposer, string description)',
    'event VoteCast(address indexed voter, uint256 proposalId, bool support)'
  ],
  TICKET: [
    'function mintTicket(address to, uint256 eventId) returns (uint256)',
    'function balanceOf(address owner) view returns (uint256)',
    'event TicketMinted(address indexed to, uint256 tokenId, uint256 eventId)'
  ]
};

// Función para obtener una instancia del contrato
export function getContract(contractName, signerOrProvider = provider) {
  if (!CONTRACTS[contractName]) {
    throw new Error(`Contract ${contractName} not configured`);
  }

  if (!ABIS[contractName]) {
    throw new Error(`ABI for ${contractName} not found`);
  }

  return new ethers.Contract(
    CONTRACTS[contractName],
    ABIS[contractName],
    signerOrProvider
  );
}

// Verificar conexión a la blockchain
export async function checkBlockchainConnection() {
  try {
    const network = await provider.getNetwork();
    const blockNumber = await provider.getBlockNumber();

    console.log('✅ Blockchain connection successful');
    console.log(`   Network: ${network.name} (Chain ID: ${network.chainId})`);
    console.log(`   Current block: ${blockNumber}`);

    return true;
  } catch (error) {
    console.warn('⚠️  Blockchain not available:', error.message);
    console.log('ℹ️  This is OK - blockchain features will be disabled');
    return false;
  }
}

export default {
  BLOCKCHAIN_CONFIG,
  provider,
  adminWallet,
  CONTRACTS,
  ABIS,
  getContract,
  checkBlockchainConnection
};

