import express from 'express';
import {
  getUserMembership,
  updateUserXP,
  getMembershipBenefits
} from '../controllers/membership.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';

const router = express.Router();

// Todas las rutas requieren autenticación
router.get('/:userId', authenticate, getUserMembership);
router.post('/:userId/xp', authenticate, updateUserXP);
router.get('/:userId/benefits', authenticate, getMembershipBenefits);

export default router;

