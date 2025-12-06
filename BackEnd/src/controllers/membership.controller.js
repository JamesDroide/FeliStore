import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Calcular nivel de membresía basado en balance y XP
const calculateMembershipLevel = (feliBalance, xpPoints) => {
  if (feliBalance >= 10000 && xpPoints >= 2000) {
    return {
      level: 'PLATINUM',
      apy: 7.5,
      cashback: 15,
      benefits: ['APY 7.5%', '15% Cashback', 'Acceso VIP', 'NFTs Exclusivos']
    };
  } else if (feliBalance >= 5000 && xpPoints >= 1000) {
    return {
      level: 'GOLD',
      apy: 5.4,
      cashback: 10,
      benefits: ['APY 5.4%', '10% Cashback', 'Descuentos', 'Eventos']
    };
  } else {
    return {
      level: 'SILVER',
      apy: 3.0,
      cashback: 5,
      benefits: ['APY 3.0%', '5% Cashback', 'Acceso básico']
    };
  }
};

// Obtener membresía del usuario
export const getUserMembership = async (req, res) => {
  try {
    const { userId } = req.params;

    // Obtener usuario con balance y XP
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        xpPoints: true,
        membership: true
      }
    });

    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    // Calcular nivel basado en balance (esto vendría del smart contract)
    // Por ahora usamos un valor de ejemplo
    const feliBalance = 0; // TODO: Obtener del smart contract

    const calculatedLevel = calculateMembershipLevel(feliBalance, user.xpPoints);

    // Actualizar o crear membresía
    let membership = await prisma.userMembership.upsert({
      where: { userId },
      update: {
        level: calculatedLevel.level,
        apy: calculatedLevel.apy,
        cashback: calculatedLevel.cashback,
        benefits: calculatedLevel.benefits
      },
      create: {
        userId,
        level: calculatedLevel.level,
        apy: calculatedLevel.apy,
        cashback: calculatedLevel.cashback,
        benefits: calculatedLevel.benefits
      }
    });

    res.json(membership);
  } catch (error) {
    console.error('Error obteniendo membresía:', error);
    res.status(500).json({ error: 'Error al obtener membresía' });
  }
};

// Actualizar XP del usuario
export const updateUserXP = async (req, res) => {
  try {
    const { userId } = req.params;
    const { xpToAdd } = req.body;

    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        xpPoints: {
          increment: xpToAdd
        }
      },
      include: {
        membership: true
      }
    });

    // Recalcular membresía
    const feliBalance = 0; // TODO: Obtener del smart contract
    const calculatedLevel = calculateMembershipLevel(feliBalance, user.xpPoints);

    // Actualizar membresía si cambió de nivel
    if (user.membership && user.membership.level !== calculatedLevel.level) {
      await prisma.userMembership.update({
        where: { userId },
        data: {
          level: calculatedLevel.level,
          apy: calculatedLevel.apy,
          cashback: calculatedLevel.cashback,
          benefits: calculatedLevel.benefits
        }
      });
    }

    res.json({
      message: 'XP actualizado exitosamente',
      user,
      newLevel: calculatedLevel.level
    });
  } catch (error) {
    console.error('Error actualizando XP:', error);
    res.status(500).json({ error: 'Error al actualizar XP' });
  }
};

// Obtener beneficios de la membresía
export const getMembershipBenefits = async (req, res) => {
  try {
    const { userId } = req.params;

    const membership = await prisma.userMembership.findUnique({
      where: { userId },
      include: {
        user: {
          select: {
            xpPoints: true
          }
        }
      }
    });

    if (!membership) {
      return res.status(404).json({ error: 'Membresía no encontrada' });
    }

    res.json({
      level: membership.level,
      apy: membership.apy,
      cashback: membership.cashback,
      benefits: membership.benefits,
      xpPoints: membership.user.xpPoints
    });
  } catch (error) {
    console.error('Error obteniendo beneficios:', error);
    res.status(500).json({ error: 'Error al obtener beneficios de membresía' });
  }
};

