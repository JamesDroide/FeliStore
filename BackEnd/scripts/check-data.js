import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkData() {
  console.log('🔍 Verificando datos en la base de datos...\n');

  try {
    // Verificar cupones
    const coupons = await prisma.coupon.findMany();
    console.log(`📋 Cupones encontrados: ${coupons.length}`);
    if (coupons.length > 0) {
      console.log('Cupones:');
      coupons.forEach(c => console.log(`  - ${c.title} (${c.code})`));
    }

    // Verificar eventos
    const events = await prisma.event.findMany();
    console.log(`\n🎫 Eventos encontrados: ${events.length}`);
    if (events.length > 0) {
      console.log('Eventos:');
      events.forEach(e => console.log(`  - ${e.name} (${e.ticketPrice} FELI)`));
    }

    // Verificar productos
    const products = await prisma.product.findMany();
    console.log(`\n📦 Productos encontrados: ${products.length}`);
    if (products.length > 0) {
      console.log('Productos:');
      products.forEach(p => console.log(`  - ${p.name} (${p.priceFELI} FELI)`));
    }

    // Verificar usuarios
    const users = await prisma.user.findMany();
    console.log(`\n👥 Usuarios encontrados: ${users.length}`);
    if (users.length > 0) {
      console.log('Usuarios:');
      users.forEach(u => console.log(`  - ${u.email} (${u.name || 'sin nombre'})`));
    }

    console.log('\n✅ Verificación completada');
  } catch (error) {
    console.error('❌ Error verificando datos:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkData();

