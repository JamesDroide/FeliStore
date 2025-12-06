import blockchainService from '../services/blockchain.service.js';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Obtiene el balance de FELI de un usuario
 */
export const getBalance = async (req, res) => {
  try {
    const { walletAddress } = req.params;

    if (!walletAddress) {
      return res.status(400).json({ error: 'Wallet address requerida' });
    }

    const balance = await blockchainService.getBalance(walletAddress);

    res.json({
      walletAddress,
      balance,
      symbol: 'FELI'
    });
  } catch (error) {
    console.error('Error obteniendo balance:', error);
    res.status(500).json({ error: 'Error obteniendo balance' });
  }
};

/**
 * Verifica si un usuario está verificado on-chain
 */
export const checkVerification = async (req, res) => {
  try {
    const { walletAddress } = req.params;

    if (!walletAddress) {
      return res.status(400).json({ error: 'Wallet address requerida' });
    }

    const isVerified = await blockchainService.isUserVerified(walletAddress);

    res.json({
      walletAddress,
      isVerified
    });
  } catch (error) {
    console.error('Error verificando identidad:', error);
    res.status(500).json({ error: 'Error verificando identidad' });
  }
};

/**
 * Obtiene información de staking de un usuario
 */
export const getStakingInfo = async (req, res) => {
  try {
    const { walletAddress } = req.params;

    if (!walletAddress) {
      return res.status(400).json({ error: 'Wallet address requerida' });
    }

    const stakingInfo = await blockchainService.getStakingInfo(walletAddress);

    res.json({
      walletAddress,
      staking: stakingInfo
    });
  } catch (error) {
    console.error('Error obteniendo info de staking:', error);
    res.status(500).json({ error: 'Error obteniendo información de staking' });
  }
};

/**
 * Obtiene información de un evento
 */
export const getEvent = async (req, res) => {
  try {
    const { eventId } = req.params;

    if (!eventId) {
      return res.status(400).json({ error: 'Event ID requerido' });
    }

    const event = await blockchainService.getEvent(parseInt(eventId));

    res.json({
      eventId: parseInt(eventId),
      ...event
    });
  } catch (error) {
    console.error('Error obteniendo evento:', error);
    res.status(500).json({ error: 'Error obteniendo evento' });
  }
};

/**
 * Obtiene todos los eventos activos
 */
export const getActiveEvents = async (req, res) => {
  try {
    // Obtener eventos desde la base de datos
    const events = await prisma.event.findMany({
      where: { isActive: true },
      orderBy: { eventDate: 'asc' }
    });

    res.json({ events });
  } catch (error) {
    console.error('Error obteniendo eventos:', error);
    res.status(500).json({ error: 'Error obteniendo eventos' });
  }
};

/**
 * Obtiene estadísticas del sistema blockchain
 */
export const getSystemStats = async (req, res) => {
  try {
    const stats = await blockchainService.getSystemStats();

    // Obtener estadísticas adicionales de la BD
    const [totalUsers, totalTransactions, verifiedUsers] = await Promise.all([
      prisma.user.count(),
      prisma.transaction.count({ where: { status: 'CONFIRMED' } }),
      prisma.user.count({ where: { isVerified: true } })
    ]);

    res.json({
      blockchain: stats,
      database: {
        totalUsers,
        totalTransactions,
        verifiedUsers
      }
    });
  } catch (error) {
    console.error('Error obteniendo estadísticas:', error);
    res.status(500).json({ error: 'Error obteniendo estadísticas' });
  }
};

/**
 * Obtiene información de una transacción
 */
export const getTransaction = async (req, res) => {
  try {
    const { txHash } = req.params;

    if (!txHash) {
      return res.status(400).json({ error: 'Transaction hash requerido' });
    }

    // Buscar en la BD primero
    const dbTransaction = await prisma.transaction.findUnique({
      where: { txHash },
      include: {
        user: {
          select: {
            id: true,
            walletAddress: true,
            name: true,
            nickname: true
          }
        }
      }
    });

    // Obtener información adicional de la blockchain
    const blockchainTx = await blockchainService.getTransaction(txHash);

    res.json({
      database: dbTransaction,
      blockchain: blockchainTx
    });
  } catch (error) {
    console.error('Error obteniendo transacción:', error);
    res.status(500).json({ error: 'Error obteniendo transacción' });
  }
};

/**
 * Sincroniza el wallet address de un usuario
 */
export const syncWalletAddress = async (req, res) => {
  try {
    const userId = req.user.id;
    const { walletAddress } = req.body;

    if (!walletAddress) {
      return res.status(400).json({ error: 'Wallet address requerida' });
    }

    // Validar formato de wallet address (Ethereum)
    if (!/^0x[a-fA-F0-9]{40}$/.test(walletAddress)) {
      return res.status(400).json({ error: 'Formato de wallet address inválido' });
    }

    // Verificar que no esté en uso
    const existingUser = await prisma.user.findUnique({
      where: { walletAddress: walletAddress.toLowerCase() }
    });

    if (existingUser && existingUser.id !== userId) {
      return res.status(400).json({ error: 'Esta wallet ya está asociada a otra cuenta' });
    }

    // Actualizar usuario
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { walletAddress: walletAddress.toLowerCase() }
    });

    // Obtener balance
    const balance = await blockchainService.getBalance(walletAddress);

    res.json({
      message: 'Wallet sincronizada correctamente',
      walletAddress: updatedUser.walletAddress,
      balance
    });
  } catch (error) {
    console.error('Error sincronizando wallet:', error);
    res.status(500).json({ error: 'Error sincronizando wallet' });
  }
};

