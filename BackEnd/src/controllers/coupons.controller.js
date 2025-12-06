import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Obtener todos los cupones disponibles
export const getAvailableCoupons = async (req, res) => {
  try {
    console.log('📋 Buscando cupones disponibles...');

    const coupons = await prisma.coupon.findMany({
      where: {
        isActive: true,
        OR: [
          { expiresAt: null },
          { expiresAt: { gt: new Date() } }
        ]
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    console.log(`✅ Cupones encontrados: ${coupons.length}`);
    if (coupons.length > 0) {
      console.log('Primer cupón:', coupons[0]);
    }

    res.json(coupons);
  } catch (error) {
    console.error('❌ Error obteniendo cupones:', error);
    res.status(500).json({ error: 'Error al obtener cupones' });
  }
};

// Obtener cupones del usuario
export const getUserCoupons = async (req, res) => {
  try {
    const { userId } = req.params;

    const userCoupons = await prisma.userCoupon.findMany({
      where: {
        userId,
        isUsed: false
      },
      include: {
        coupon: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    res.json(userCoupons);
  } catch (error) {
    console.error('Error obteniendo cupones de usuario:', error);
    res.status(500).json({ error: 'Error al obtener cupones del usuario' });
  }
};

// Canjear un cupón
export const redeemCoupon = async (req, res) => {
  try {
    const { couponId } = req.params;
    const { userId } = req.body;

    console.log('🎫 Canjeando cupón:', { couponId, userId });

    // Verificar que el cupón existe
    const coupon = await prisma.coupon.findUnique({
      where: { id: couponId }
    });

    if (!coupon) {
      return res.status(404).json({ error: 'Cupón no encontrado' });
    }

    if (!coupon.isActive) {
      return res.status(400).json({ error: 'Cupón no está activo' });
    }

    // Verificar si se alcanzó el límite de canjes
    if (coupon.maxRedemptions && coupon.redemptionsCount >= coupon.maxRedemptions) {
      return res.status(400).json({ error: 'Cupón agotado' });
    }

    // Verificar si ya tiene el cupón
    const existingUserCoupon = await prisma.userCoupon.findUnique({
      where: {
        userId_couponId: {
          userId,
          couponId
        }
      }
    });

    // Si ya lo canjeó pero no lo usó, retornar el cupón existente
    if (existingUserCoupon) {
      if (existingUserCoupon.isUsed) {
        return res.status(400).json({
          error: 'Ya has usado este cupón',
          userCoupon: existingUserCoupon
        });
      } else {
        return res.json({
          message: 'Ya tienes este cupón en tu billetera',
          userCoupon: existingUserCoupon,
          alreadyRedeemed: true
        });
      }
    }

    // Crear el cupón para el usuario y actualizar contador
    const [userCoupon] = await prisma.$transaction([
      prisma.userCoupon.create({
        data: {
          userId,
          couponId,
          isUsed: false
        },
        include: {
          coupon: true
        }
      }),
      prisma.coupon.update({
        where: { id: couponId },
        data: {
          redemptionsCount: {
            increment: 1
          }
        }
      })
    ]);

    console.log('✅ Cupón canjeado exitosamente');

    res.json({
      message: 'Cupón canjeado exitosamente',
      userCoupon
    });
  } catch (error) {
    console.error('❌ Error canjeando cupón:', error);
    res.status(500).json({ error: 'Error al canjear cupón' });
  }
};

// Usar un cupón en una compra
export const useCoupon = async (req, res) => {
  try {
    const { userCouponId, purchaseId } = req.body;

    const userCoupon = await prisma.userCoupon.update({
      where: { id: userCouponId },
      data: {
        isUsed: true,
        usedAt: new Date(),
        purchaseId
      },
      include: {
        coupon: true
      }
    });

    res.json({
      message: 'Cupón usado exitosamente',
      userCoupon
    });
  } catch (error) {
    console.error('Error usando cupón:', error);
    res.status(500).json({ error: 'Error al usar cupón' });
  }
};

// Crear nuevo cupón (admin)
export const createCoupon = async (req, res) => {
  try {
    const { code, title, description, discount, cost, category, expiresAt, maxUses } = req.body;

    const coupon = await prisma.coupon.create({
      data: {
        code,
        title,
        description,
        discount,
        cost,
        category,
        expiresAt: expiresAt ? new Date(expiresAt) : null,
        maxUses: maxUses || 1,
        isActive: true
      }
    });

    res.status(201).json(coupon);
  } catch (error) {
    console.error('Error creando cupón:', error);
    res.status(500).json({ error: 'Error al crear cupón' });
  }
};

