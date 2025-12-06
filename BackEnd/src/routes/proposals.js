import express from 'express';
const router = express.Router();

// TODO: Implementar controllers de propuestas

router.get('/', (req, res) => {
  res.json({ message: 'Proposals endpoint - Coming soon' });
});

export default router;

