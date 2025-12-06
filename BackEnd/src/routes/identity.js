import express from 'express';
const router = express.Router();

// TODO: Implementar controllers de identity

router.get('/', (req, res) => {
  res.json({ message: 'Identity endpoint - Coming soon' });
});

export default router;

