import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import rateLimit from 'express-rate-limit';

// Importar rutas
import authRouter from './routes/auth.js';
import productsRouter from './routes/products.js';
import usersRouter from './routes/users.js';
import proposalsRouter from './routes/proposals.js';
import identityRouter from './routes/identity.js';
import transactionsRouter from './routes/transactions.js';
import blockchainRouter from './routes/blockchain.routes.js';
import reviewsRouter from './routes/reviews.routes.js';
import couponsRouter from './routes/coupons.routes.js';
import membershipRouter from './routes/membership.routes.js';
import eventsRouter from './routes/events.routes.js';

// Importar servicios
import blockchainListener from './services/blockchainListener.js';

// Configuración
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middlewares
app.use(helmet()); // Seguridad HTTP headers
app.use(morgan('dev')); // Logs de requests
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutos
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 1000, // 1000 requests en desarrollo
  message: 'Too many requests, please try again later.'
});

// Solo aplicar rate limiting en producción
if (process.env.NODE_ENV === 'production') {
  app.use('/api/', limiter);
  console.log('⚠️  Rate limiting habilitado (Producción)');
} else {
  console.log('✅ Rate limiting deshabilitado (Desarrollo)');
}

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV
  });
});

// Endpoint de prueba para verificar rutas
app.get('/api/test', (req, res) => {
  res.json({ message: 'Backend funcionando correctamente', timestamp: new Date().toISOString() });
});

// Rutas API
app.use('/api/auth', authRouter);
app.use('/api/products', productsRouter);
app.use('/api/users', usersRouter);
app.use('/api/proposals', proposalsRouter);
app.use('/api/identity', identityRouter);
app.use('/api/transactions', transactionsRouter);
app.use('/api/blockchain', blockchainRouter);
app.use('/api/reviews', reviewsRouter);
app.use('/api/coupons', couponsRouter);
app.use('/api/membership', membershipRouter);
app.use('/api/events', eventsRouter);

// Ruta raíz
app.get('/', (req, res) => {
  res.json({
    message: 'Felimarket Backend API',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      products: '/api/products',
      users: '/api/users',
      proposals: '/api/proposals',
      identity: '/api/identity',
      transactions: '/api/transactions',
      blockchain: '/api/blockchain',
      health: '/health'
    }
  });
});

// Manejo de errores 404
app.use((req, res) => {
  res.status(404).json({
    error: 'Endpoint not found',
    path: req.path
  });
});

// Manejo de errores global
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// Iniciar servidor
app.listen(PORT, async () => {
  console.log(`
╔═══════════════════════════════════════════════════════╗
║                                                       ║
║   🚀 FELIMARKET BACKEND API                          ║
║                                                       ║
║   Server running on: http://localhost:${PORT}         ║
║   Environment: ${process.env.NODE_ENV}                        ║
║                                                       ║
╚═══════════════════════════════════════════════════════╝
  `);

  // Iniciar listener de blockchain (opcional)
  try {
    await blockchainListener.start();
    console.log('✅ Blockchain listener started successfully');
  } catch (error) {
    console.warn('⚠️  Blockchain not available:', error.message);
    console.log('ℹ️  API running without blockchain events (this is OK for now)');
  }
});

// Manejo de señales de cierre
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT signal received: closing HTTP server');
  process.exit(0);
});

export default app;

