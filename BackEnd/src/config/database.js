import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
});

// Manejo de errores de conexión
prisma.$connect()
  .then(() => {
    console.log('✅ Database connected successfully');
  })
  .catch((error) => {
    console.error('❌ Database connection failed:', error.message);
    console.warn('⚠️  Server will start without database connection');
    console.log('ℹ️  Please configure PostgreSQL - see DATABASE_SETUP.md');
  });

// Cierre limpio de la conexión
process.on('beforeExit', async () => {
  await prisma.$disconnect();
});

export default prisma;

