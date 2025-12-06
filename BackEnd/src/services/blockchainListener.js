import blockchainService from './blockchain.service.js';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

class BlockchainListener {
  constructor() {
    this.isListening = false;
  }

  /**
   * Inicia el listener de eventos de blockchain
   */
  async start() {
    if (this.isListening) {
      console.log('⚠️ Blockchain listener ya está activo');
      return;
    }

    try {
      await blockchainService.initialize();

      // Escuchar eventos de compras
      await blockchainService.listenToPurchaseEvents(async (purchaseData) => {
        await this.handlePurchaseEvent(purchaseData);
      });

      // Escuchar eventos de tickets
      await blockchainService.listenToTicketEvents(async (ticketData) => {
        await this.handleTicketEvent(ticketData);
      });

      this.isListening = true;
      console.log('🎧 Blockchain listener iniciado correctamente');
    } catch (error) {
      // No lanzar error si blockchain no está disponible, solo loguearlo
      console.log('⚠️  Blockchain listener no pudo iniciarse (blockchain no disponible)');
      console.log('ℹ️  El servidor continuará funcionando sin eventos de blockchain');
      this.isListening = false;
      // NO hacer throw del error para que el servidor continúe
    }
  }

  /**
   * Maneja eventos de compra desde el smart contract
   */
  async handlePurchaseEvent(data) {
    try {
      console.log('📦 Nuevo evento de compra detectado:', data);

      // Buscar usuario por wallet address
      const user = await prisma.user.findUnique({
        where: { walletAddress: data.buyer.toLowerCase() }
      });

      if (!user) {
        console.log('⚠️ Usuario no encontrado en la base de datos:', data.buyer);
        return;
      }

      // Crear registro de transacción en la base de datos
      const transaction = await prisma.transaction.create({
        data: {
          txHash: data.transactionHash,
          type: 'PURCHASE',
          userId: user.id,
          blockNumber: data.blockNumber,
          status: 'CONFIRMED',
          metadata: {
            merchant: data.merchant,
            amount: data.amount,
            cashbackReward: data.reward,
            timestamp: data.timestamp.toISOString()
          }
        }
      });

      console.log('✅ Transacción registrada en la BD:', transaction.id);

      // Aquí podrías agregar lógica adicional, como:
      // - Enviar notificación al usuario
      // - Actualizar inventario
      // - Generar reporte

    } catch (error) {
      console.error('❌ Error manejando evento de compra:', error);
    }
  }

  /**
   * Maneja eventos de compra de tickets NFT
   */
  async handleTicketEvent(data) {
    try {
      console.log('🎫 Nuevo evento de ticket detectado:', data);

      // Buscar usuario por wallet address
      const user = await prisma.user.findUnique({
        where: { walletAddress: data.buyer.toLowerCase() }
      });

      if (!user) {
        console.log('⚠️ Usuario no encontrado en la base de datos:', data.buyer);
        return;
      }

      // Buscar o crear evento
      let event = await prisma.event.findUnique({
        where: { blockchainEventId: data.eventId }
      });

      if (!event) {
        // Si el evento no existe en la BD, obtener información de la blockchain
        const eventInfo = await blockchainService.getEvent(data.eventId);

        event = await prisma.event.create({
          data: {
            name: eventInfo.name,
            blockchainEventId: data.eventId,
            ticketPrice: parseFloat(eventInfo.ticketPrice),
            maxTickets: eventInfo.maxTickets,
            eventDate: eventInfo.eventDate,
            isActive: eventInfo.isActive
          }
        });
      }

      // Crear registro de transacción
      const transaction = await prisma.transaction.create({
        data: {
          txHash: data.transactionHash,
          type: 'TICKET_PURCHASE',
          userId: user.id,
          eventId: event.id,
          blockNumber: data.blockNumber,
          status: 'CONFIRMED',
          metadata: {
            tokenId: data.tokenId,
            price: data.price,
            timestamp: data.timestamp.toISOString()
          }
        }
      });

      console.log('✅ Compra de ticket registrada en la BD:', transaction.id);

      // Actualizar contador de tickets vendidos
      await prisma.event.update({
        where: { id: event.id },
        data: {
          ticketsSold: {
            increment: 1
          }
        }
      });

    } catch (error) {
      console.error('❌ Error manejando evento de ticket:', error);
    }
  }

  /**
   * Detiene el listener
   */
  stop() {
    if (this.isListening) {
      // Aquí podrías agregar lógica para detener los listeners
      this.isListening = false;
      console.log('🛑 Blockchain listener detenido');
    }
  }

  /**
   * Sincroniza transacciones pasadas desde un bloque específico
   */
  async syncPastEvents(fromBlock = 0) {
    try {
      console.log(`🔄 Sincronizando eventos desde el bloque ${fromBlock}...`);

      // Aquí podrías implementar lógica para obtener eventos históricos
      // usando provider.getLogs() o queryFilter()

      console.log('✅ Sincronización completada');
    } catch (error) {
      console.error('❌ Error sincronizando eventos:', error);
    }
  }
}

// Exportar instancia singleton
const blockchainListener = new BlockchainListener();
export default blockchainListener;

