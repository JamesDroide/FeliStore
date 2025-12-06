import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Crear nueva transacción
export const createTransaction = async (req, res) => {
  try {
    const { txHash, type, userId, productId, eventId, amount, status, metadata, blockNumber } = req.body;

    console.log('📝 Creando transacción:', { txHash, type, userId, productId, amount });

    // Validar campos requeridos
    if (!txHash || !type || !userId || !amount) {
      console.error('❌ Faltan campos requeridos:', { txHash, type, userId, amount });
      return res.status(400).json({
        error: 'Faltan campos requeridos: txHash, type, userId, amount'
      });
    }

    // Crear la transacción
    const transaction = await prisma.transaction.create({
      data: {
        txHash,
        type,
        userId,
        productId: productId || null,
        eventId: eventId || null,
        amount: amount.toString(), // Convertir a string para BigInt
        status: status && ['PENDING', 'CONFIRMED', 'FAILED'].includes(status) ? status : 'CONFIRMED',
        metadata: metadata || {},
        blockNumber: blockNumber || null
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
            nickname: true
          }
        },
        product: true,
        event: true
      }
    });

    console.log('✅ Transacción creada:', transaction.id);

    // Actualizar XP del usuario (100 XP por transacción)
    try {
      await prisma.user.update({
        where: { id: userId },
        data: {
          xpPoints: {
            increment: 100
          }
        }
      });
      console.log('✅ XP actualizado para usuario:', userId);
    } catch (xpError) {
      console.warn('⚠️ Error actualizando XP (no crítico):', xpError.message);
      // No bloquear la respuesta si falla el XP
    }

    res.status(201).json(transaction);
  } catch (error) {
    console.error('❌ Error creando transacción:', error.message);
    console.error('❌ Stack:', error.stack);
    res.status(500).json({
      error: 'Error creando transacción',
      details: error.message
    });
  }
};

// Obtener transacciones de un usuario
export const getUserTransactions = async (req, res) => {
  try {
    const { userId } = req.params;
    const { page = 1, limit = 10, type } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const where = {
      userId,
      ...(type && { type })
    };

    const [transactions, total] = await Promise.all([
      prisma.transaction.findMany({
        where,
        include: {
          product: {
            select: {
              id: true,
              name: true,
              imageUrl: true,
              priceFELI: true,
              priceUSD: true
            }
          },
          event: {
            select: {
              id: true,
              name: true,
              eventDate: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        },
        skip,
        take: parseInt(limit)
      }),
      prisma.transaction.count({ where })
    ]);

    res.json({
      transactions,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('❌ Error obteniendo transacciones:', error);
    res.status(500).json({ error: 'Error obteniendo transacciones' });
  }
};

// Obtener estadísticas de transacciones del usuario
export const getUserTransactionStats = async (req, res) => {
  try {
    const { userId } = req.params;

    // Obtener todas las transacciones para calcular totales
    const purchases = await prisma.transaction.findMany({
      where: {
        userId,
        type: 'PURCHASE',
        status: 'CONFIRMED'
      }
    });

    const cashbackTransactions = await prisma.transaction.findMany({
      where: {
        userId,
        type: 'CASHBACK',
        status: 'CONFIRMED'
      }
    });

    const recentTransactions = await prisma.transaction.findMany({
      where: { userId },
      include: {
        product: {
          select: {
            name: true,
            imageUrl: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 5
    });

    // Calcular totales manualmente porque amount es String
    const totalSpent = purchases.reduce((sum, tx) => sum + parseFloat(tx.amount || 0), 0);
    const totalCashback = cashbackTransactions.reduce((sum, tx) => sum + parseFloat(tx.amount || 0), 0);

    res.json({
      totalSpent: totalSpent.toString(),
      totalPurchases: purchases.length,
      totalCashback: totalCashback.toString(),
      recentTransactions
    });
  } catch (error) {
    console.error('❌ Error obteniendo estadísticas:', error);
    res.status(500).json({ error: 'Error obteniendo estadísticas' });
  }
};

// Obtener transacción por ID
export const getTransactionById = async (req, res) => {
  try {
    const { id } = req.params;

    const transaction = await prisma.transaction.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
            nickname: true
          }
        },
        product: true,
        event: true
      }
    });

    if (!transaction) {
      return res.status(404).json({ error: 'Transacción no encontrada' });
    }

    res.json(transaction);
  } catch (error) {
    console.error('❌ Error obteniendo transacción:', error);
    res.status(500).json({ error: 'Error obteniendo transacción' });
  }
};


