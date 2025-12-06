import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Obtener todos los eventos NFT disponibles
export const getAvailableEvents = async (req, res) => {
  try {
    console.log('🎫 Buscando eventos disponibles...');

    const events = await prisma.event.findMany({
      where: {
        isActive: true,
        eventDate: {
          gte: new Date() // Solo eventos futuros
        }
      },
      orderBy: {
        eventDate: 'asc'
      }
    });

    console.log(`✅ Eventos encontrados: ${events.length}`);
    if (events.length > 0) {
      console.log('Primer evento:', events[0]);
    }

    // Calcular tickets disponibles
    const eventsWithAvailability = events.map(event => ({
      ...event,
      ticketsAvailable: event.maxTickets - event.ticketsSold
    }));

    res.json(eventsWithAvailability);
  } catch (error) {
    console.error('❌ Error obteniendo eventos:', error);
    res.status(500).json({ error: 'Error al obtener eventos' });
  }
};

// Obtener un evento específico
export const getEventById = async (req, res) => {
  try {
    const { eventId } = req.params;

    const event = await prisma.event.findUnique({
      where: { id: eventId }
    });

    if (!event) {
      return res.status(404).json({ error: 'Evento no encontrado' });
    }

    res.json({
      ...event,
      ticketsAvailable: event.maxTickets - event.ticketsSold
    });
  } catch (error) {
    console.error('Error obteniendo evento:', error);
    res.status(500).json({ error: 'Error al obtener evento' });
  }
};

// Comprar ticket NFT para un evento
export const buyEventTicket = async (req, res) => {
  try {
    const { eventId } = req.params;
    const { userId, txHash } = req.body;

    // Verificar que el evento existe
    const event = await prisma.event.findUnique({
      where: { id: eventId }
    });

    if (!event) {
      return res.status(404).json({ error: 'Evento no encontrado' });
    }

    if (!event.isActive) {
      return res.status(400).json({ error: 'Evento no está activo' });
    }

    if (event.ticketsSold >= event.maxTickets) {
      return res.status(400).json({ error: 'No hay tickets disponibles' });
    }

    // Crear transacción
    const transaction = await prisma.transaction.create({
      data: {
        txHash,
        type: 'TICKET_PURCHASE',
        userId,
        eventId,
        amount: event.ticketPrice.toString(),
        status: 'CONFIRMED',
        metadata: {
          eventName: event.name,
          eventDate: event.eventDate
        }
      },
      include: {
        event: true,
        user: true
      }
    });

    // Incrementar tickets vendidos
    await prisma.event.update({
      where: { id: eventId },
      data: {
        ticketsSold: {
          increment: 1
        }
      }
    });

    res.json({
      message: 'Ticket NFT comprado exitosamente',
      transaction
    });
  } catch (error) {
    console.error('Error comprando ticket:', error);
    res.status(500).json({ error: 'Error al comprar ticket' });
  }
};

// Obtener tickets del usuario
export const getUserTickets = async (req, res) => {
  try {
    const { userId } = req.params;

    const tickets = await prisma.transaction.findMany({
      where: {
        userId,
        type: 'TICKET_PURCHASE',
        status: 'CONFIRMED'
      },
      include: {
        event: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    res.json(tickets);
  } catch (error) {
    console.error('Error obteniendo tickets:', error);
    res.status(500).json({ error: 'Error al obtener tickets del usuario' });
  }
};

// Crear nuevo evento (admin)
export const createEvent = async (req, res) => {
  try {
    const {
      name,
      description,
      eventDate,
      location,
      ticketPrice,
      maxTickets,
      imageUrl,
      metadataURI,
      requiresVerification
    } = req.body;

    const event = await prisma.event.create({
      data: {
        name,
        description,
        eventDate: new Date(eventDate),
        location,
        ticketPrice,
        maxTickets,
        imageUrl,
        metadataURI,
        requiresVerification: requiresVerification || false,
        isActive: true
      }
    });

    res.status(201).json(event);
  } catch (error) {
    console.error('Error creando evento:', error);
    res.status(500).json({ error: 'Error al crear evento' });
  }
};

// Actualizar evento (admin)
export const updateEvent = async (req, res) => {
  try {
    const { eventId } = req.params;
    const updates = req.body;

    if (updates.eventDate) {
      updates.eventDate = new Date(updates.eventDate);
    }

    const event = await prisma.event.update({
      where: { id: eventId },
      data: updates
    });

    res.json(event);
  } catch (error) {
    console.error('Error actualizando evento:', error);
    res.status(500).json({ error: 'Error al actualizar evento' });
  }
};

