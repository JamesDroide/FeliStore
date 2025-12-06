import express from 'express';
import {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct
} from '../controllers/products.controller.js';

const router = express.Router();

/**
 * @route   GET /api/products
 * @desc    Obtener todos los productos
 * @access  Public
 */
router.get('/', getAllProducts);

/**
 * @route   GET /api/products/:id
 * @desc    Obtener un producto por ID
 * @access  Public
 */
router.get('/:id', getProductById);

/**
 * @route   POST /api/products
 * @desc    Crear un nuevo producto
 * @access  Admin
 */
router.post('/', createProduct);

/**
 * @route   PUT /api/products/:id
 * @desc    Actualizar un producto
 * @access  Admin
 */
router.put('/:id', updateProduct);

/**
 * @route   DELETE /api/products/:id
 * @desc    Eliminar un producto (soft delete)
 * @access  Admin
 */
router.delete('/:id', deleteProduct);

export default router;

