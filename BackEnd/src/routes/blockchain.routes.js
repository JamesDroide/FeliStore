import express from 'express';
import { authenticate } from '../middleware/auth.middleware.js';
import {
  getBalance,
  checkVerification,
  getStakingInfo,
  getEvent,
  getActiveEvents,
  getSystemStats,
  getTransaction,
  syncWalletAddress
} from '../controllers/blockchain.controller.js';

const router = express.Router();

// Rutas públicas
router.get('/stats', getSystemStats);
router.get('/events', getActiveEvents);
router.get('/events/:eventId', getEvent);
router.get('/transaction/:txHash', getTransaction);

// Rutas protegidas (requieren autenticación)
router.get('/balance/:walletAddress', authenticate, getBalance);
router.get('/verification/:walletAddress', authenticate, checkVerification);
router.get('/staking/:walletAddress', authenticate, getStakingInfo);
router.post('/sync-wallet', authenticate, syncWalletAddress);

export default router;

