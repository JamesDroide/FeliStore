// reviews.routes.js - Rutas para reseñas de productos
import express from 'express';
import {
  getProductReviews,
  createReview,
  updateReview,
  deleteReview,
  getMyReviews
} from '../controllers/reviews.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';

const router = express.Router();

// Rutas públicas
router.get('/product/:productId', getProductReviews);

// Rutas protegidas
router.get('/my-reviews', authenticate, getMyReviews);
router.post('/', authenticate, createReview);
router.put('/:id', authenticate, updateReview);
router.delete('/:id', authenticate, deleteReview);

export default router;

