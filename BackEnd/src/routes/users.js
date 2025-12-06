import express from 'express';
import {
  getUserByWallet,
  updateUser,
  verifyIdentity,
  getVerificationStatus,
  getUserTransactions
} from '../controllers/users.controller.js';

const router = express.Router();

/**
 * @route   PUT /api/users/profile/:userId
 * @desc    Actualizar información del usuario (nombre, nickname, email)
 * @access  Private
 */
router.put('/profile/:userId', updateUser);

/**
 * @route   GET /api/users/:walletAddress
 * @desc    Obtener usuario por wallet address
 * @access  Public
 */
router.get('/:walletAddress', getUserByWallet);


/**
 * @route   POST /api/users/:walletAddress/verify
 * @desc    Verificar identidad del usuario en blockchain
 * @access  Admin
 */
router.post('/:walletAddress/verify', verifyIdentity);

/**
 * @route   GET /api/users/:walletAddress/verification
 * @desc    Obtener estado de verificación
 * @access  Public
 */
router.get('/:walletAddress/verification', getVerificationStatus);

/**
 * @route   GET /api/users/:walletAddress/transactions
 * @desc    Obtener transacciones del usuario
 * @access  Private
 */
router.get('/:walletAddress/transactions', getUserTransactions);

export default router;

