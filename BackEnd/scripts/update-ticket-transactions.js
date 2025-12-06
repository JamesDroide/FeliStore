import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🔄 Actualizando transacciones de tickets...');

  try {
    const result = await prisma.transaction.updateMany({
      where: {
        type: 'TICKET_PURCHASE'
      },
      data: {
        status: 'CONFIRMED'
      }
    });

    console.log(`✅ ${result.count} transacciones actualizadas a CONFIRMED`);

    // Mostrar las transacciones actualizadas
    const tickets = await prisma.transaction.findMany({
      where: {
        type: 'TICKET_PURCHASE'
      },
      include: {
        event: true,
        user: {
          select: {
            email: true,
            name: true
          }
        }
      }
    });

    console.log('\n📊 Tickets NFT en el sistema:');
    tickets.forEach((t) => {
      console.log(`- ${t.event?.name || 'Evento desconocido'} (${t.user?.email}) - Estado: ${t.status}`);
    });

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();

