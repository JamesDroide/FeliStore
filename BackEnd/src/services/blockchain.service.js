import { ethers } from 'ethers';
import dotenv from 'dotenv';

dotenv.config();

// Importar configuración de contratos
import contractsConfig from '../config/contracts.config.js';

// ABIs de los contratos (se generarán después de la compilación)
const FELICOIN_ABI = [
  "function balanceOf(address account) view returns (uint256)",
  "function transfer(address to, uint256 amount) returns (bool)",
  "function approve(address spender, uint256 amount) returns (bool)",
  "function allowance(address owner, address spender) view returns (uint256)",
  "function mint(address to, uint256 amount)",
  "function burn(uint256 amount)",
  "event Transfer(address indexed from, address indexed to, uint256 value)",
  "event Approval(address indexed owner, address indexed spender, uint256 value)"
];

const LOYALTY_PAYMENT_ABI = [
  "function processPurchase(address merchant, uint256 amount)",
  "function setMerchantAuthorization(address merchant, bool authorized)",
  "function cashbackRate() view returns (uint256)",
  "function totalPurchases() view returns (uint256)",
  "function totalCashbackDistributed() view returns (uint256)",
  "function isMerchantAuthorized(address merchant) view returns (bool)",
  "event PurchaseProcessed(address indexed buyer, address indexed merchant, uint256 amount, uint256 reward, uint256 timestamp)"
];

const IDENTITY_REGISTRY_ABI = [
  "function registerIdentity(address user, bytes32 documentHash)",
  "function revokeIdentity(address user)",
  "function isVerified(address user) view returns (bool)",
  "function getIdentity(address user) view returns (bool, bytes32, uint256, address)",
  "event IdentityRegistered(address indexed user, bytes32 documentHash, address indexed verifier, uint256 timestamp)"
];

const EVENT_TICKET_ABI = [
  "function createEvent(string memory name, uint256 ticketPrice, uint256 maxTickets, uint256 eventDate, bool requiresVerification, string memory metadataURI) returns (uint256)",
  "function buyTicket(uint256 eventId) returns (uint256)",
  "function getEvent(uint256 eventId) view returns (string, uint256, uint256, uint256, uint256, bool, bool)",
  "function hasTicketForEvent(address user, uint256 eventId) view returns (bool)",
  "event TicketPurchased(uint256 indexed tokenId, uint256 indexed eventId, address indexed buyer, uint256 price, uint256 timestamp)"
];

const STAKING_ABI = [
  "function stake(uint256 amount)",
  "function withdraw(uint256 amount)",
  "function claimRewards()",
  "function calculateRewards(address user) view returns (uint256)",
  "function getStakeInfo(address user) view returns (uint256, uint256, uint256, uint256)",
  "event Staked(address indexed user, uint256 amount, uint256 timestamp)",
  "event Withdrawn(address indexed user, uint256 amount, uint256 timestamp)",
  "event RewardsClaimed(address indexed user, uint256 amount, uint256 timestamp)"
];

class BlockchainService {
  constructor() {
    this.provider = null;
    this.contracts = {};
    this.initialized = false;
  }

  /**
   * Inicializa la conexión con la blockchain
   */
  async initialize() {
    try {
      const rpcUrl = process.env.BLOCKCHAIN_RPC_URL || 'http://127.0.0.1:8545';
      this.provider = new ethers.JsonRpcProvider(rpcUrl);

      // Verificar conexión
      await this.provider.getNetwork();
      console.log('✅ Conectado a la blockchain:', rpcUrl);

      // Inicializar contratos
      this.contracts.felicoin = new ethers.Contract(
        contractsConfig.FelicoinToken,
        FELICOIN_ABI,
        this.provider
      );

      this.contracts.loyalty = new ethers.Contract(
        contractsConfig.LoyaltyPayment,
        LOYALTY_PAYMENT_ABI,
        this.provider
      );

      this.contracts.identity = new ethers.Contract(
        contractsConfig.IdentityRegistry,
        IDENTITY_REGISTRY_ABI,
        this.provider
      );

      this.contracts.eventTicket = new ethers.Contract(
        contractsConfig.EventTicket,
        EVENT_TICKET_ABI,
        this.provider
      );

      this.contracts.staking = new ethers.Contract(
        contractsConfig.FelicoinStaking,
        STAKING_ABI,
        this.provider
      );

      this.initialized = true;
      console.log('✅ Contratos inicializados correctamente');

      return true;
    } catch (error) {
      // Solo loguear como info si es error de conexión
      if (error.code === 'ECONNREFUSED') {
        console.log('ℹ️  Blockchain node no disponible (esto es normal en desarrollo)');
      } else {
        console.log('ℹ️  No se pudo conectar a blockchain:', error.message);
      }
      throw error;
    }
  }

  /**
   * Obtiene el balance de FELI de una dirección
   */
  async getBalance(address) {
    if (!this.initialized) await this.initialize();

    try {
      const balance = await this.contracts.felicoin.balanceOf(address);
      return ethers.formatEther(balance);
    } catch (error) {
      console.error('Error obteniendo balance:', error);
      throw error;
    }
  }

  /**
   * Verifica si una dirección es un comercio autorizado
   */
  async isMerchantAuthorized(address) {
    if (!this.initialized) await this.initialize();

    try {
      return await this.contracts.loyalty.isMerchantAuthorized(address);
    } catch (error) {
      console.error('Error verificando comercio:', error);
      throw error;
    }
  }

  /**
   * Verifica si un usuario está verificado
   */
  async isUserVerified(address) {
    if (!this.initialized) await this.initialize();

    try {
      return await this.contracts.identity.isVerified(address);
    } catch (error) {
      console.error('Error verificando identidad:', error);
      throw error;
    }
  }

  /**
   * Obtiene información de un evento
   */
  async getEvent(eventId) {
    if (!this.initialized) await this.initialize();

    try {
      const event = await this.contracts.eventTicket.getEvent(eventId);
      return {
        name: event[0],
        ticketPrice: ethers.formatEther(event[1]),
        maxTickets: Number(event[2]),
        ticketsSold: Number(event[3]),
        eventDate: new Date(Number(event[4]) * 1000),
        isActive: event[5],
        requiresVerification: event[6]
      };
    } catch (error) {
      console.error('Error obteniendo evento:', error);
      throw error;
    }
  }

  /**
   * Obtiene información de staking de un usuario
   */
  async getStakingInfo(address) {
    if (!this.initialized) await this.initialize();

    try {
      const info = await this.contracts.staking.getStakeInfo(address);
      return {
        amount: ethers.formatEther(info[0]),
        stakedAt: new Date(Number(info[1]) * 1000),
        lastClaimAt: new Date(Number(info[2]) * 1000),
        pendingRewards: ethers.formatEther(info[3])
      };
    } catch (error) {
      console.error('Error obteniendo info de staking:', error);
      throw error;
    }
  }

  /**
   * Obtiene estadísticas generales del sistema
   */
  async getSystemStats() {
    if (!this.initialized) await this.initialize();

    try {
      const [totalPurchases, totalCashback, cashbackRate] = await Promise.all([
        this.contracts.loyalty.totalPurchases(),
        this.contracts.loyalty.totalCashbackDistributed(),
        this.contracts.loyalty.cashbackRate()
      ]);

      return {
        totalPurchases: Number(totalPurchases),
        totalCashback: ethers.formatEther(totalCashback),
        cashbackRate: Number(cashbackRate) / 100 // Convertir de basis points a porcentaje
      };
    } catch (error) {
      console.error('Error obteniendo estadísticas:', error);
      throw error;
    }
  }

  /**
   * Escucha eventos de compra
   */
  async listenToPurchaseEvents(callback) {
    if (!this.initialized) await this.initialize();

    try {
      this.contracts.loyalty.on('PurchaseProcessed', (buyer, merchant, amount, reward, timestamp, event) => {
        callback({
          buyer,
          merchant,
          amount: ethers.formatEther(amount),
          reward: ethers.formatEther(reward),
          timestamp: new Date(Number(timestamp) * 1000),
          transactionHash: event.log.transactionHash,
          blockNumber: event.log.blockNumber
        });
      });

      console.log('✅ Escuchando eventos de compra...');
    } catch (error) {
      console.error('Error escuchando eventos:', error);
      throw error;
    }
  }

  /**
   * Escucha eventos de tickets
   */
  async listenToTicketEvents(callback) {
    if (!this.initialized) await this.initialize();

    try {
      this.contracts.eventTicket.on('TicketPurchased', (tokenId, eventId, buyer, price, timestamp, event) => {
        callback({
          tokenId: Number(tokenId),
          eventId: Number(eventId),
          buyer,
          price: ethers.formatEther(price),
          timestamp: new Date(Number(timestamp) * 1000),
          transactionHash: event.log.transactionHash,
          blockNumber: event.log.blockNumber
        });
      });

      console.log('✅ Escuchando eventos de tickets...');
    } catch (error) {
      console.error('Error escuchando eventos de tickets:', error);
      throw error;
    }
  }

  /**
   * Obtiene el hash de una transacción
   */
  async getTransaction(txHash) {
    if (!this.initialized) await this.initialize();

    try {
      const tx = await this.provider.getTransaction(txHash);
      const receipt = await this.provider.getTransactionReceipt(txHash);

      return {
        hash: tx.hash,
        from: tx.from,
        to: tx.to,
        value: ethers.formatEther(tx.value),
        gasUsed: receipt.gasUsed.toString(),
        blockNumber: receipt.blockNumber,
        status: receipt.status === 1 ? 'success' : 'failed'
      };
    } catch (error) {
      console.error('Error obteniendo transacción:', error);
      throw error;
    }
  }
}

// Exportar instancia singleton
const blockchainService = new BlockchainService();
export default blockchainService;

