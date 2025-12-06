// Configuración de direcciones de contratos
// IMPORTANTE: Actualizar estas direcciones después del deploy

export const CONTRACTS = {
  // Red Local (Hardhat/Ganache)
  localhost: {
    FELICOIN: '0x5FbDB2315678afecb367f032d93F642f64180aa3', // Ejemplo
    LOYALTY: '0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512',
    IDENTITY: '0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0',
    GOVERNOR: '0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9',
    TICKET: '0xDc64a140Aa3E981100a9becA4E685f962f0cF6C9',
  },

  // Red Sepolia (Testnet)
  sepolia: {
    FELICOIN: '0x0000000000000000000000000000000000000000', // Actualizar después del deploy
    LOYALTY: '0x0000000000000000000000000000000000000000',
    IDENTITY: '0x0000000000000000000000000000000000000000',
    GOVERNOR: '0x0000000000000000000000000000000000000000',
    TICKET: '0x0000000000000000000000000000000000000000',
  },
};

// Detectar red activa
export const getContractAddresses = (chainId) => {
  if (chainId === 31337n) {
    return CONTRACTS.localhost;
  } else if (chainId === 11155111n) {
    return CONTRACTS.sepolia;
  }
  throw new Error('Red no soportada');
};

// Nombres de red
export const NETWORK_NAMES = {
  '31337': 'Localhost',
  '11155111': 'Sepolia Testnet',
  '1': 'Ethereum Mainnet',
};

