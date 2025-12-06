import express from 'express';
import {
  createTransaction,
  getUserTransactions,
  getUserTransactionStats,
  getTransactionById
} from '../controllers/transactions.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';

const router = express.Router();

// Rutas específicas primero (para evitar que /:id las capture)
// Obtener transacciones de un usuario (requiere autenticación)
router.get('/user/:userId', authenticate, getUserTransactions);

// Obtener estadísticas de transacciones (requiere autenticación)
router.get('/user/:userId/stats', authenticate, getUserTransactionStats);

// Crear nueva transacción (pública - llamada desde el frontend después del pago)
router.post('/', createTransaction);

// Obtener transacción por ID (última para no interferir con rutas específicas)
router.get('/:id', getTransactionById);

export default router;

