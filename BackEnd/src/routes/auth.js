import express from 'express';
import { register, login, linkWallet, verifySession, changePassword } from '../controllers/auth.controller.js';

const router = express.Router();

/**
 * @route   POST /api/auth/register
 * @desc    Registrar nuevo usuario con email/password
 * @access  Public
 */
router.post('/register', register);

/**
 * @route   POST /api/auth/login
 * @desc    Login con email y password
 * @access  Public
 */
router.post('/login', login);

/**
 * @route   POST /api/auth/link-wallet
 * @desc    Vincular wallet address a cuenta existente
 * @access  Private
 */
router.post('/link-wallet', linkWallet);

/**
 * @route   GET /api/auth/verify/:email
 * @desc    Verificar sesión de usuario
 * @access  Public
 */
router.get('/verify/:email', verifySession);

/**
 * @route   POST /api/auth/change-password
 * @desc    Cambiar contraseña del usuario
 * @access  Private
 */
router.post('/change-password', changePassword);

export default router;

