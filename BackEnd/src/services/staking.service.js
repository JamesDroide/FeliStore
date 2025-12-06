import { getContract } from '../config/blockchain.js';
import { ethers } from 'ethers';

/**
 * Servicio de Staking - Manejo de staking y recompensas
 */

/**
 * Obtener información de staking de un usuario
 * @param {string} userAddress - Dirección del usuario
 * @returns {Promise<Object>} Información de staking
 */
export async function getUserStakingInfo(userAddress) {
  try {
    const loyaltyContract = getContract('LOYALTY');

    const stakedAmount = await loyaltyContract.getStakedAmount(userAddress);
    const cashbackEarned = await loyaltyContract.getCashback(userAddress);

    return {
      userAddress,
      stakedAmount: ethers.formatEther(stakedAmount),
      stakedAmountWei: stakedAmount.toString(),
      cashbackEarned: ethers.formatEther(cashbackEarned),
      cashbackEarnedWei: cashbackEarned.toString(),
      apy: 5.4 // Esto debería venir del contrato
    };
  } catch (error) {
    console.error('Error getting staking info:', error);
    throw error;
  }
}

/**
 * Calcular recompensas estimadas
 * @param {string} amount - Cantidad stakeada en FELI
 * @param {number} days - Días de staking
 * @returns {Object} Recompensas estimadas
 */
export function calculateStakingRewards(amount, days = 30) {
  const APY = 5.4; // 5.4%
  const dailyRate = APY / 365 / 100;

  const amountFloat = parseFloat(amount);
  const dailyReward = amountFloat * dailyRate;
  const totalReward = dailyReward * days;

  return {
    dailyReward: dailyReward.toFixed(6),
    monthlyReward: (dailyReward * 30).toFixed(6),
    yearlyReward: (amountFloat * (APY / 100)).toFixed(6),
    customPeriodReward: totalReward.toFixed(6),
    days
  };
}

/**
 * Obtener historial de staking de un usuario
 * @param {string} userAddress - Dirección del usuario
 * @returns {Promise<Array>} Historial de transacciones de staking
 */
export async function getStakingHistory(userAddress) {
  try {
    const transactions = await prisma.transaction.findMany({
      where: {
        userId: userAddress.toLowerCase(),
        type: {
          in: ['STAKE', 'UNSTAKE', 'STAKING_REWARD']
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return transactions.map(tx => ({
      id: tx.id,
      type: tx.type,
      amount: ethers.formatEther(tx.amount),
      amountWei: tx.amount,
      txHash: tx.txHash,
      status: tx.status,
      createdAt: tx.createdAt,
      blockNumber: tx.blockNumber
    }));
  } catch (error) {
    console.error('Error getting staking history:', error);
    throw error;
  }
}

export default {
  getUserStakingInfo,
  calculateStakingRewards,
  getStakingHistory
};

