import prisma from '../config/database.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

/**
 * Controller de Autenticación
 */

// Función helper para generar JWT
const generateToken = (userId) => {
  return jwt.sign(
    { userId },
    process.env.JWT_SECRET || 'felistore-secret-key',
    { expiresIn: '7d' }
  );
};

// Registrar nuevo usuario
export const register = async (req, res) => {
  try {
    const { email, password, name, nickname } = req.body;

    // Validaciones
    if (!email || !password || !name) {
      return res.status(400).json({
        success: false,
        error: 'Email, password y nombre son requeridos'
      });
    }

    // Verificar si el usuario ya existe
    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase() }
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        error: 'Ya existe un usuario con este email'
      });
    }

    // Hash de la contraseña
    const hashedPassword = await bcrypt.hash(password, 10);

    // Crear usuario
    const user = await prisma.user.create({
      data: {
        email: email.toLowerCase(),
        password: hashedPassword,
        name,
        nickname: nickname || null,
        isVerified: false,
        role: 'USER'
      }
    });

    // Generar token JWT
    const token = generateToken(user.id);

    // No enviar password en la respuesta
    const { password: _, ...userWithoutPassword } = user;

    res.status(201).json({
      success: true,
      message: 'Usuario registrado exitosamente',
      token,
      user: userWithoutPassword
    });
  } catch (error) {
    console.error('Error al registrar usuario:', error);
    res.status(500).json({
      success: false,
      error: 'Error al registrar usuario'
    });
  }
};

// Login con email y password
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validaciones
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Email y contraseña son requeridos'
      });
    }

    // Buscar usuario
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() }
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Credenciales incorrectas'
      });
    }

    // Verificar contraseña
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        error: 'Credenciales incorrectas'
      });
    }

    // Obtener estadísticas del usuario
    const transactions = await prisma.transaction.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
      take: 10
    });

    // Contar transacciones por tipo (no podemos hacer _sum porque amount es String)
    const purchaseCount = await prisma.transaction.count({
      where: {
        userId: user.id,
        type: 'PURCHASE'
      }
    });

    const cashbackCount = await prisma.transaction.count({
      where: {
        userId: user.id,
        type: 'CASHBACK'
      }
    });

    // Generar token JWT
    const token = generateToken(user.id);

    // No enviar password en la respuesta
    const { password: _, ...userWithoutPassword } = user;

    res.json({
      success: true,
      message: 'Login exitoso',
      token,
      user: {
        ...userWithoutPassword,
        stats: {
          totalTransactions: transactions.length,
          totalPurchases: purchaseCount,
          totalCashbackTransactions: cashbackCount
        }
      },
      recentTransactions: transactions
    });
  } catch (error) {
    console.error('Error durante el login:', error);
    res.status(500).json({
      success: false,
      error: 'Error durante el login'
    });
  }
};

// Vincular wallet address (después de login)
export const linkWallet = async (req, res) => {
  try {
    const { userId, walletAddress } = req.body;

    if (!userId || !walletAddress) {
      return res.status(400).json({
        success: false,
        error: 'userId y walletAddress son requeridos'
      });
    }

    // Verificar que la wallet no esté en uso
    const existingWallet = await prisma.user.findUnique({
      where: { walletAddress: walletAddress.toLowerCase() }
    });

    if (existingWallet && existingWallet.id !== userId) {
      return res.status(400).json({
        success: false,
        error: 'Esta wallet ya está vinculada a otra cuenta'
      });
    }

    // Actualizar usuario con wallet
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { walletAddress: walletAddress.toLowerCase() }
    });

    const { password: _, ...userWithoutPassword } = updatedUser;

    res.json({
      success: true,
      message: 'Wallet vinculada exitosamente',
      user: userWithoutPassword
    });
  } catch (error) {
    console.error('Error al vincular wallet:', error);
    res.status(500).json({
      success: false,
      error: 'Error al vincular wallet'
    });
  }
};

// Verificar sesión (check si el usuario existe por email)
export const verifySession = async (req, res) => {
  try {
    const { email } = req.params;

    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() }
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'Usuario no encontrado'
      });
    }

    const { password: _, ...userWithoutPassword } = user;

    res.json({
      success: true,
      user: userWithoutPassword
    });
  } catch (error) {
    console.error('Error al verificar sesión:', error);
    res.status(500).json({
      success: false,
      error: 'Error al verificar sesión'
    });
  }
};

// Cambiar contraseña
export const changePassword = async (req, res) => {
  try {
    const { userId, currentPassword, newPassword } = req.body;

    // Validaciones
    if (!userId || !currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        error: 'Todos los campos son requeridos'
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        error: 'La nueva contraseña debe tener al menos 6 caracteres'
      });
    }

    // Obtener usuario
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'Usuario no encontrado'
      });
    }

    // Verificar contraseña actual
    const isPasswordValid = await bcrypt.compare(currentPassword, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        error: 'La contraseña actual es incorrecta'
      });
    }

    // Hash de la nueva contraseña
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Actualizar contraseña
    await prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword }
    });

    res.json({
      success: true,
      message: 'Contraseña actualizada exitosamente'
    });
  } catch (error) {
    console.error('Error al cambiar contraseña:', error);
    res.status(500).json({
      success: false,
      error: 'Error al cambiar contraseña'
    });
  }
};

export default {
  register,
  login,
  linkWallet,
  verifySession
};

