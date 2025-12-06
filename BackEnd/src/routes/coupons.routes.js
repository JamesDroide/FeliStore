import express from 'express';
import {
  getAvailableCoupons,
  getUserCoupons,
  redeemCoupon,
  useCoupon,
  createCoupon
} from '../controllers/coupons.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';

const router = express.Router();

// Rutas públicas
router.get('/available', getAvailableCoupons);

// Rutas protegidas
router.get('/user/:userId', authenticate, getUserCoupons);
router.post('/redeem/:couponId', authenticate, redeemCoupon);
router.post('/use', authenticate, useCoupon);

// Rutas admin
router.post('/create', authenticate, createCoupon);

export default router;

