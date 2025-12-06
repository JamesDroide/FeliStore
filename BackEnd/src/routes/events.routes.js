import express from 'express';
import {
  getAvailableEvents,
  getEventById,
  buyEventTicket,
  getUserTickets,
  createEvent,
  updateEvent
} from '../controllers/events.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';

const router = express.Router();

// Rutas públicas
router.get('/available', getAvailableEvents);
router.get('/:eventId', getEventById);

// Rutas protegidas
router.post('/:eventId/buy', authenticate, buyEventTicket);
router.get('/user/:userId/tickets', authenticate, getUserTickets);

// Rutas admin
router.post('/create', authenticate, createEvent);
router.put('/:eventId', authenticate, updateEvent);

export default router;

