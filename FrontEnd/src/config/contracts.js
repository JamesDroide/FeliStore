// Configuración de contratos desplegados
// Generado automáticamente
// Red: localhost

export const contractAddresses = {
  FelicoinToken: "0x5FbDB2315678afecb367f032d93F642f64180aa3",
  IdentityRegistry: "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512",
  LoyaltyPayment: "0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0",
  EventTicket: "0xDc64a140Aa3E981100a9becA4E685f962f0cF6C9",
  FelicoinStaking: "0x5FC8d32690cc91D4c39d9d3abcBD16989F875707",
  FelicoinGovernor: "0x0165878A594ca255338adfa4d48449f69242Eb8F"
};

export const networkConfig = {
  network: "localhost",
  chainId: 1337,
  rpcUrl: "http://127.0.0.1:8545",
  blockExplorer: "http://localhost:8545"
};

// ABIs mínimos
export const FelicoinTokenABI = [
  "function name() view returns (string)",
  "function symbol() view returns (string)",
  "function decimals() view returns (uint8)",
  "function totalSupply() view returns (uint256)",
  "function balanceOf(address account) view returns (uint256)",
  "function transfer(address to, uint256 amount) returns (bool)",
  "function approve(address spender, uint256 amount) returns (bool)",
  "function allowance(address owner, address spender) view returns (uint256)",
  "function transferFrom(address from, address to, uint256 amount) returns (bool)",
  "event Transfer(address indexed from, address indexed to, uint256 value)",
  "event Approval(address indexed owner, address indexed spender, uint256 value)"
];

export const FelicoinStakingABI = [
  "function stake(uint256 amount)",
  "function withdraw(uint256 amount)",
  "function claimRewards()",
  "function getStakeInfo(address user) view returns (uint256 amount, uint256 rewardDebt, uint256 pendingRewards)",
  "function calculateRewards(address user) view returns (uint256)",
  "function rewardRate() view returns (uint256)",
  "event Staked(address indexed user, uint256 amount)",
  "event Withdrawn(address indexed user, uint256 amount)",
  "event RewardsClaimed(address indexed user, uint256 amount)"
];

export const LoyaltyPaymentABI = [
  "function processPurchase(address merchant, uint256 amount)",
  "function cashbackRate() view returns (uint256)",
  "function totalPurchases() view returns (uint256)",
  "function totalCashbackDistributed() view returns (uint256)",
  "function isMerchantAuthorized(address merchant) view returns (bool)",
  "event PurchaseProcessed(address indexed buyer, address indexed merchant, uint256 amount, uint256 reward, uint256 timestamp)"
];

export const IdentityRegistryABI = [
  "function registerIdentity(address user, bytes32 documentHash)",
  "function revokeIdentity(address user)",
  "function isVerified(address user) view returns (bool)",
  "function getIdentity(address user) view returns (bool isVerified, bytes32 documentHash, uint256 timestamp, address verifier)",
  "event IdentityRegistered(address indexed user, bytes32 documentHash, address indexed verifier, uint256 timestamp)",
  "event IdentityRevoked(address indexed user, address indexed revoker, uint256 timestamp)"
];

export const EventTicketABI = [
  "function createEvent(string memory name, uint256 ticketPrice, uint256 maxTickets, uint256 eventDate, bool requiresVerification, string memory metadataURI) returns (uint256)",
  "function buyTicket(uint256 eventId) returns (uint256)",
  "function getEvent(uint256 eventId) view returns (tuple(string name, uint256 ticketPrice, uint256 maxTickets, uint256 ticketsSold, uint256 eventDate, bool requiresVerification, bool isActive, string metadataURI))",
  "function hasTicketForEvent(address user, uint256 eventId) view returns (bool)",
  "function getTicketInfo(uint256 tokenId) view returns (uint256 eventId, address owner, uint256 purchaseDate)",
  "event TicketPurchased(uint256 indexed tokenId, uint256 indexed eventId, address indexed buyer, uint256 price, uint256 timestamp)",
  "event EventCreated(uint256 indexed eventId, string name, uint256 ticketPrice, uint256 maxTickets, uint256 eventDate)"
];

export default {
  addresses: contractAddresses,
  network: networkConfig,
  abis: {
    FelicoinToken: FelicoinTokenABI,
    FelicoinStaking: FelicoinStakingABI,
    LoyaltyPayment: LoyaltyPaymentABI,
    IdentityRegistry: IdentityRegistryABI,
    EventTicket: EventTicketABI
  }
};

