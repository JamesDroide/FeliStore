import { getContract, adminWallet } from '../config/blockchain.js';
import prisma from '../config/database.js';

/**
 * Servicio de Identity - Manejo de verificación de identidad en blockchain
 */

/**
 * Verificar identidad de un usuario en blockchain
 * @param {string} userAddress - Dirección del usuario
 * @returns {Promise<Object>} Resultado de la verificación
 */
export async function verifyUserIdentity(userAddress) {
  try {
    if (!adminWallet) {
      throw new Error('Admin wallet not configured');
    }

    const identityContract = getContract('IDENTITY', adminWallet);

    // Llamar al contrato para verificar identidad
    const tx = await identityContract.verifyIdentity(userAddress);
    await tx.wait();

    // Actualizar en base de datos
    await prisma.user.upsert({
      where: { walletAddress: userAddress.toLowerCase() },
      update: { isVerified: true },
      create: {
        walletAddress: userAddress.toLowerCase(),
        isVerified: true
      }
    });

    return {
      success: true,
      txHash: tx.hash,
      userAddress,
      message: 'Identity verified successfully'
    };
  } catch (error) {
    console.error('Error verifying identity:', error);
    throw error;
  }
}

/**
 * Verificar si un usuario está verificado
 * @param {string} userAddress - Dirección del usuario
 * @returns {Promise<boolean>} True si está verificado
 */
export async function isUserVerified(userAddress) {
  try {
    const identityContract = getContract('IDENTITY');
    const isVerified = await identityContract.isVerified(userAddress);
    return isVerified;
  } catch (error) {
    console.error('Error checking verification status:', error);
    throw error;
  }
}

/**
 * Obtener estado de verificación desde BD
 * @param {string} userAddress - Dirección del usuario
 * @returns {Promise<Object>} Estado del usuario
 */
export async function getUserVerificationStatus(userAddress) {
  try {
    const user = await prisma.user.findUnique({
      where: { walletAddress: userAddress.toLowerCase() }
    });

    if (!user) {
      return {
        exists: false,
        isVerified: false
      };
    }

    return {
      exists: true,
      isVerified: user.isVerified,
      createdAt: user.createdAt
    };
  } catch (error) {
    console.error('Error getting user verification status:', error);
    throw error;
  }
}

export default {
  verifyUserIdentity,
  isUserVerified,
  getUserVerificationStatus
};

