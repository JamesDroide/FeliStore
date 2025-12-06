import prisma from '../config/database.js';
import { getContract } from '../config/blockchain.js';
import { ethers } from 'ethers';
import { verifyUserIdentity, getUserVerificationStatus } from '../services/identity.service.js';

/**
 * Controller de Usuarios
 */

// Obtener o crear usuario por wallet address
export const getUserByWallet = async (req, res) => {
  try {
    const { walletAddress } = req.params;

    let user = await prisma.user.findUnique({
      where: { walletAddress: walletAddress.toLowerCase() }
    });

    // Si el usuario no existe, crearlo
    if (!user) {
      user = await prisma.user.create({
        data: {
          walletAddress: walletAddress.toLowerCase()
        }
      });
    }

    // Obtener balance de FELI del contrato
    const felicoinContract = getContract('FELICOIN');
    const balance = await felicoinContract.balanceOf(walletAddress);

    res.json({
      success: true,
      user: {
        ...user,
        feliBalance: ethers.formatEther(balance),
        feliBalanceWei: balance.toString()
      }
    });
  } catch (error) {
    console.error('Error getting user:', error);
    res.status(500).json({
      success: false,
      error: 'Error fetching user'
    });
  }
};

// Actualizar información del usuario
export const updateUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const { name, email, nickname } = req.body;

    // Verificar si el email ya existe (si se está cambiando)
    if (email) {
      const existingUser = await prisma.user.findUnique({
        where: { email: email.toLowerCase() }
      });

      if (existingUser && existingUser.id !== userId) {
        return res.status(400).json({
          success: false,
          error: 'Email already in use'
        });
      }
    }

    const updateData = {};
    if (name) updateData.name = name;
    if (nickname !== undefined) updateData.nickname = nickname; // Permitir vacío
    if (email) updateData.email = email.toLowerCase();

    const user = await prisma.user.update({
      where: { id: userId },
      data: updateData
    });

    const { password: _, ...userWithoutPassword } = user;

    res.json({
      success: true,
      message: 'User updated successfully',
      user: userWithoutPassword
    });
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({
      success: false,
      error: 'Error updating user'
    });
  }
};

// Verificar identidad del usuario
export const verifyIdentity = async (req, res) => {
  try {
    const { walletAddress } = req.params;

    const result = await verifyUserIdentity(walletAddress);

    res.json({
      success: true,
      message: 'Identity verified successfully',
      ...result
    });
  } catch (error) {
    console.error('Error verifying identity:', error);
    res.status(500).json({
      success: false,
      error: 'Error verifying identity'
    });
  }
};

// Obtener estado de verificación
export const getVerificationStatus = async (req, res) => {
  try {
    const { walletAddress } = req.params;

    const status = await getUserVerificationStatus(walletAddress);

    res.json({
      success: true,
      walletAddress,
      ...status
    });
  } catch (error) {
    console.error('Error getting verification status:', error);
    res.status(500).json({
      success: false,
      error: 'Error fetching verification status'
    });
  }
};

// Obtener transacciones del usuario
export const getUserTransactions = async (req, res) => {
  try {
    const { walletAddress } = req.params;
    const { type, limit = 50 } = req.query;

    const where = {
      userId: walletAddress.toLowerCase(),
      ...(type && { type })
    };

    const transactions = await prisma.transaction.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: parseInt(limit),
      include: {
        product: true,
        event: true
      }
    });

    res.json({
      success: true,
      count: transactions.length,
      transactions: transactions.map(tx => ({
        ...tx,
        amountFormatted: ethers.formatEther(tx.amount || '0')
      }))
    });
  } catch (error) {
    console.error('Error getting user transactions:', error);
    res.status(500).json({
      success: false,
      error: 'Error fetching transactions'
    });
  }
};

export default {
  getUserByWallet,
  updateUser,
  verifyIdentity,
  getVerificationStatus,
  getUserTransactions
};

