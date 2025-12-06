import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Limpiar datos existentes
  await prisma.userCoupon.deleteMany();
  await prisma.coupon.deleteMany();
  await prisma.transaction.deleteMany();
  await prisma.proposal.deleteMany();
  await prisma.event.deleteMany();
  await prisma.product.deleteMany();
  await prisma.userMembership.deleteMany();
  await prisma.user.deleteMany();
  await prisma.config.deleteMany();

  console.log('✅ Database cleaned');
  console.log('ℹ️  No default users created - users will register themselves');

  // Crear cupones disponibles
  console.log('📋 Creating coupons...');
  await prisma.coupon.createMany({
    data: [
      {
        code: 'TECH20',
        title: '20% Descuento en Electrónica',
        description: 'Válido en todos los productos de tecnología',
        discount: 20,
        cost: 500,
        category: 'Tecnología',
        expiresAt: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000), // 15 días
        maxUses: 1,
        maxRedemptions: 100, // Máximo 100 usuarios pueden canjear
        redemptionsCount: 0,
        isActive: true
      },
      {
        code: 'CASHBACK15',
        title: '15% Cashback Extra',
        description: 'Cashback adicional en tu próxima compra',
        discount: 15,
        cost: 300,
        category: 'Cashback',
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 días
        maxUses: 1,
        maxRedemptions: 200, // Máximo 200 usuarios pueden canjear
        redemptionsCount: 0,
        isActive: true
      },
      {
        code: 'FREESHIP',
        title: 'Envío Gratis Premium',
        description: '3 meses de envío gratis en todas tus compras',
        discount: 100,
        cost: 800,
        category: 'Envío',
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 días
        maxUses: 1,
        maxRedemptions: 50, // Máximo 50 usuarios pueden canjear
        redemptionsCount: 0,
        isActive: true
      },
      {
        code: 'WATCH50',
        title: '50% en Smart Watch',
        description: 'Descuento especial en Smart Watch NFT Edition',
        discount: 50,
        cost: 1000,
        category: 'Productos',
        expiresAt: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 días
        maxUses: 1,
        maxRedemptions: 30, // Máximo 30 usuarios pueden canjear
        redemptionsCount: 0,
        isActive: true
      }
    ]
  });
  console.log('✅ Coupons created');

  // Crear eventos NFT
  console.log('🎫 Creating NFT events...');
  await prisma.event.createMany({
    data: [
      {
        name: 'Concierto Blockchain Festival 2025',
        description: 'El festival de música más grande del metaverso',
        eventDate: new Date('2025-12-25'),
        location: 'Metaverso Arena',
        ticketPrice: 2500,
        maxTickets: 100,
        ticketsSold: 50,
        imageUrl: '/events/concert.jpg',
        metadataURI: 'ipfs://QmConcertMetadata',
        requiresVerification: true,
        isActive: true
      },
      {
        name: 'Tech Summit Web3',
        description: 'Conferencia de tecnología blockchain y Web3',
        eventDate: new Date('2026-01-15'),
        location: 'Virtual Conference',
        ticketPrice: 1500,
        maxTickets: 200,
        ticketsSold: 80,
        imageUrl: '/events/tech-summit.jpg',
        metadataURI: 'ipfs://QmTechSummitMetadata',
        requiresVerification: true,
        isActive: true
      },
      {
        name: 'Crypto Expo 2026',
        description: 'La expo de criptomonedas más grande del año',
        eventDate: new Date('2026-02-10'),
        location: 'Convention Center',
        ticketPrice: 3000,
        maxTickets: 150,
        ticketsSold: 70,
        imageUrl: '/events/crypto-expo.jpg',
        metadataURI: 'ipfs://QmCryptoExpoMetadata',
        requiresVerification: false,
        isActive: true
      }
    ]
  });
  console.log('✅ Events created');

  // Crear productos del marketplace (coinciden con el frontend)
  const products = await prisma.product.createMany({
    data: [
      {
        name: 'Smart Watch Ultra',
        description: 'Reloj inteligente de última generación con todas las funciones',
        priceFELI: 2500,
        priceUSD: 125.00,
        category: 'Tech',
        stock: 15,
        imageUrl: '/products/smartwatch.jpg',
        cashback: 150,
        isActive: true
      },
      {
        name: 'Auriculares Pro',
        description: 'Auriculares con cancelación de ruido premium',
        priceFELI: 1800,
        priceUSD: 90.00,
        category: 'Tech',
        stock: 25,
        imageUrl: '/products/headphones.jpg',
        cashback: 90,
        isActive: true
      },
      {
        name: 'Laptop Gaming X1',
        description: 'Laptop de alto rendimiento para gaming',
        priceFELI: 15000,
        priceUSD: 750.00,
        category: 'Tech',
        stock: 5,
        imageUrl: '/products/laptop.jpg',
        cashback: 750,
        isActive: true
      },
      {
        name: 'Curso Trading Pro',
        description: 'Curso completo de trading y análisis técnico',
        priceFELI: 4500,
        priceUSD: 225.00,
        category: 'Servicios',
        stock: 100,
        imageUrl: '/products/course.jpg',
        cashback: 450,
        isActive: true
      },
      {
        name: 'Teclado Mecánico RGB',
        description: 'Teclado mecánico para gaming con iluminación RGB',
        priceFELI: 1200,
        priceUSD: 60.00,
        category: 'Tech',
        stock: 30,
        imageUrl: '/products/keyboard.jpg',
        cashback: 60,
        isActive: true
      },
      {
        name: 'Monitor 4K 27"',
        description: 'Monitor 4K para diseño y gaming',
        priceFELI: 5000,
        priceUSD: 250.00,
        category: 'Tech',
        stock: 10,
        imageUrl: '/products/monitor.jpg',
        cashback: 250,
        isActive: true
      },
      {
        name: 'Camiseta Premium',
        description: 'Camiseta de algodón premium con diseño exclusivo',
        priceFELI: 500,
        priceUSD: 25.00,
        category: 'Moda',
        stock: 50,
        imageUrl: '/products/tshirt.jpg',
        cashback: 25,
        isActive: true
      },
      {
        name: 'Café Gourmet Premium',
        description: 'Café de origen único, tostado artesanal',
        priceFELI: 300,
        priceUSD: 15.00,
        category: 'Gourmet',
        stock: 100,
        imageUrl: '/products/coffee.jpg',
        cashback: 15,
        isActive: true
      }
    ]
  });

  console.log(`✅ Created ${products.count} products`);


  // Crear configuración del sistema
  await prisma.config.createMany({
    data: [
      { key: 'CASHBACK_MAX_PERCENTAGE', value: '20' },
      { key: 'STAKING_APY', value: '5.4' },
      { key: 'MIN_STAKE_AMOUNT', value: '100' },
      { key: 'PLATFORM_FEE_PERCENTAGE', value: '2' }
    ]
  });

  console.log('✅ System config created');

  console.log('\n🎉 Database seeding completed successfully!');
  console.log('📝 Users can now register their own accounts at /register');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

