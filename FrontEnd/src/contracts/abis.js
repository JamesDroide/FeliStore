// ABIs de los contratos
// IMPORTANTE: Estas son interfaces básicas. Actualizar con los ABIs reales después de compilar los contratos

export const FELICOIN_ABI = [
  // ERC20 Standard
  "function balanceOf(address account) view returns (uint256)",
  "function transfer(address to, uint256 amount) returns (bool)",
  "function approve(address spender, uint256 amount) returns (bool)",
  "function allowance(address owner, address spender) view returns (uint256)",
  "function totalSupply() view returns (uint256)",
  "function name() view returns (string)",
  "function symbol() view returns (string)",
  "function decimals() view returns (uint8)",

  // Eventos
  "event Transfer(address indexed from, address indexed to, uint256 value)",
  "event Approval(address indexed owner, address indexed spender, uint256 value)",
];

export const LOYALTY_ABI = [
  // Funciones de compra
  "function processPurchase(address buyer, uint256 amount) returns (bool)",
  "function getCashbackRate() view returns (uint256)",

  // Staking
  "function stake(uint256 amount) returns (bool)",
  "function unstake(uint256 amount) returns (bool)",
  "function getStakedAmount(address user) view returns (uint256)",
  "function getRewards(address user) view returns (uint256)",
  "function claimRewards() returns (bool)",
  "function getAPY() view returns (uint256)",

  // Eventos
  "event PurchaseProcessed(address indexed buyer, uint256 amount, uint256 cashback)",
  "event Staked(address indexed user, uint256 amount)",
  "event Unstaked(address indexed user, uint256 amount)",
  "event RewardsClaimed(address indexed user, uint256 amount)",
];

export const IDENTITY_ABI = [
  // Verificación de identidad
  "function isVerified(address user) view returns (bool)",
  "function requestVerification() returns (bool)",
  "function verifyUser(address user) returns (bool)",
  "function revokeVerification(address user) returns (bool)",

  // Eventos
  "event VerificationRequested(address indexed user)",
  "event UserVerified(address indexed user)",
  "event VerificationRevoked(address indexed user)",
];

export const GOVERNOR_ABI = [
  // Propuestas
  "function propose(string description, address[] targets, uint256[] values, bytes[] calldatas) returns (uint256)",
  "function getProposal(uint256 proposalId) view returns (tuple(uint256 id, address proposer, string description, uint256 forVotes, uint256 againstVotes, uint256 startTime, uint256 endTime, bool executed))",
  "function getActiveProposals() view returns (uint256[])",

  // Votación
  "function vote(uint256 proposalId, bool support) returns (bool)",
  "function hasVoted(uint256 proposalId, address voter) view returns (bool)",
  "function getVotingPower(address voter) view returns (uint256)",

  // Ejecución
  "function execute(uint256 proposalId) returns (bool)",

  // Eventos
  "event ProposalCreated(uint256 indexed proposalId, address proposer, string description)",
  "event VoteCast(address indexed voter, uint256 indexed proposalId, bool support, uint256 votes)",
  "event ProposalExecuted(uint256 indexed proposalId)",
];

export const TICKET_ABI = [
  // ERC721 + Funciones específicas
  "function buyTicket(uint256 eventId) payable returns (uint256)",
  "function getEvent(uint256 eventId) view returns (tuple(uint256 id, string name, string description, uint256 price, uint256 maxSupply, uint256 sold, bool active))",
  "function getActiveEvents() view returns (uint256[])",
  "function getUserTickets(address user) view returns (uint256[])",
  "function tokenURI(uint256 tokenId) view returns (string)",

  // ERC721 Standard
  "function balanceOf(address owner) view returns (uint256)",
  "function ownerOf(uint256 tokenId) view returns (address)",
  "function transferFrom(address from, address to, uint256 tokenId)",

  // Eventos
  "event TicketPurchased(address indexed buyer, uint256 indexed eventId, uint256 tokenId)",
  "event EventCreated(uint256 indexed eventId, string name, uint256 price)",
];

