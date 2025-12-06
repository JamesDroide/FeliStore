import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🔍 Verificando datos del usuario en la BD...\n');

  try {
    // Buscar usuario por email
    const user = await prisma.user.findFirst({
      where: {
        email: 'mabel@gmail.com' // Cambia esto al email que estés usando
      }
    });

    if (!user) {
      console.log('❌ Usuario no encontrado');
      return;
    }

    console.log(`✅ Usuario encontrado: ${user.email} (${user.name || 'Sin nombre'})`);
    console.log(`📧 ID: ${user.id}\n`);

    // 1. Verificar cupones canjeados
    const userCoupons = await prisma.userCoupon.findMany({
      where: {
        userId: user.id
      },
      include: {
        coupon: true
      }
    });

    console.log(`📋 Cupones canjeados: ${userCoupons.length}`);
    userCoupons.forEach((uc) => {
      console.log(`   - ${uc.coupon.code}: ${uc.coupon.description}`);
      console.log(`     Usado: ${uc.usedAt ? 'Sí' : 'No'}`);
    });

    // 2. Verificar tickets NFT
    const userTickets = await prisma.transaction.findMany({
      where: {
        userId: user.id,
        type: 'TICKET_PURCHASE',
        status: 'CONFIRMED'
      },
      include: {
        event: true
      }
    });

    console.log(`\n🎫 Tickets NFT comprados: ${userTickets.length}`);
    userTickets.forEach((t) => {
      console.log(`   - ${t.event?.name || 'Evento desconocido'}`);
      console.log(`     TX: ${t.txHash?.substring(0, 20)}...`);
      console.log(`     Fecha: ${new Date(t.createdAt).toLocaleString()}`);
    });

    // 3. Verificar compras de productos
    const purchases = await prisma.transaction.findMany({
      where: {
        userId: user.id,
        type: 'PURCHASE',
        status: 'CONFIRMED'
      },
      include: {
        product: true
      }
    });

    console.log(`\n🛒 Compras de productos: ${purchases.length}`);
    purchases.forEach((p) => {
      console.log(`   - ${p.product?.name || 'Producto desconocido'}`);
      console.log(`     Monto: ${p.metadata?.totalAmount || 'N/A'} FELICOINS`);
      console.log(`     Fecha: ${new Date(p.createdAt).toLocaleString()}`);
    });

    // 4. Verificar membresía
    const membership = await prisma.membership.findUnique({
      where: {
        userId: user.id
      }
    });

    if (membership) {
      console.log(`\n👑 Membresía:`);
      console.log(`   Nivel: ${membership.level}`);
      console.log(`   Activa: ${membership.isActive ? 'Sí' : 'No'}`);
      console.log(`   Total gastado: ${membership.totalSpent} FELICOINS`);
    } else {
      console.log(`\n👤 Sin membresía (se creará automáticamente con la primera compra)`);
    }

    console.log('\n✅ Verificación completada');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();

