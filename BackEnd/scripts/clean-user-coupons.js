import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function cleanUserCoupons() {
  console.log('🧹 Limpiando cupones de usuarios...\n');

  try {
    // Eliminar todos los cupones de usuarios
    const deleted = await prisma.userCoupon.deleteMany({});
    console.log(`✅ Se eliminaron ${deleted.count} cupones de usuarios`);

    // Resetear el contador de canjes de cupones
    const coupons = await prisma.coupon.findMany();
    console.log(`\n📋 Reseteando contadores de ${coupons.length} cupones...`);

    for (const coupon of coupons) {
      await prisma.coupon.update({
        where: { id: coupon.id },
        data: { redemptionsCount: 0 }
      });
    }

    console.log('✅ Contadores reseteados');

    console.log('\n✅ Limpieza completada - Ahora puedes canjear cupones de nuevo');
  } catch (error) {
    console.error('❌ Error limpiando datos:', error);
  } finally {
    await prisma.$disconnect();
  }
}

cleanUserCoupons();

