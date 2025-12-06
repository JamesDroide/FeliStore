// Configuración automática de contratos desplegados
// Generado el: 2025-12-06T12:25:30.871Z
// Red: localhost

export const contractAddresses = {
  "FelicoinToken": "0x5FbDB2315678afecb367f032d93F642f64180aa3",
  "IdentityRegistry": "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512",
  "LoyaltyPayment": "0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0",
  "EventTicket": "0xDc64a140Aa3E981100a9becA4E685f962f0cF6C9",
  "FelicoinStaking": "0x5FC8d32690cc91D4c39d9d3abcBD16989F875707",
  "FelicoinGovernor": "0x0165878A594ca255338adfa4d48449f69242Eb8F"
};

export const networkConfig = {
  network: "localhost",
  chainId: 1337,
  rpcUrl: "http://127.0.0.1:8545"
};

export default {
  ...contractAddresses,
  ...networkConfig
};
