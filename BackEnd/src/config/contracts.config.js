// Configuración automática de contratos desplegados
// Generado el: 2025-12-06T21:33:52.039Z
// Red: localhost

export const contractAddresses = {
  "FelicoinToken": "0x2279B7A0a67DB372996a5FaB50D91eAA73d2eBe6",
  "IdentityRegistry": "0x8A791620dd6260079BF849Dc5567aDC3F2FdC318",
  "LoyaltyPayment": "0x610178dA211FEF7D417bC0e6FeD39F05609AD788",
  "EventTicket": "0xA51c1fc2f0D1a1b8494Ed1FE312d7C3a78Ed91C0",
  "FelicoinStaking": "0x0DCd1Bf9A1b36cE34237eEaFef220932846BCD82",
  "FelicoinGovernor": "0x9A676e781A523b5d0C0e43731313A708CB607508"
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
