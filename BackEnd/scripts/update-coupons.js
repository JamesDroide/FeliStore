import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🔄 Actualizando cupones existentes...');

  try {
    // Obtener todos los cupones
    const coupons = await prisma.coupon.findMany();

    console.log(`📋 Cupones encontrados: ${coupons.length}`);

    // Actualizar cada cupón con valores por defecto si no los tienen
    for (const coupon of coupons) {
      await prisma.coupon.update({
        where: { id: coupon.id },
        data: {
          maxRedemptions: coupon.maxRedemptions || 100,
          redemptionsCount: coupon.redemptionsCount || 0
        }
      });
    }

    console.log('✅ Cupones actualizados exitosamente');

    // Mostrar cupones
    const updatedCoupons = await prisma.coupon.findMany();
    console.log('\n📊 Cupones actualizados:');
    updatedCoupons.forEach((c) => {
      console.log(`- ${c.title}: maxRedemptions=${c.maxRedemptions}, count=${c.redemptionsCount}`);
    });
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();

