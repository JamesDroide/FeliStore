// products.controller.js - Controlador para productos del marketplace
import prisma from '../config/database.js';

// Obtener todos los productos
export const getAllProducts = async (req, res) => {
  try {
    const { category, search, limit, offset } = req.query;

    const where = {
      isActive: true
    };

    if (category) {
      where.category = category;
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } }
      ];
    }

    const products = await prisma.product.findMany({
      where,
      take: limit ? parseInt(limit) : undefined,
      skip: offset ? parseInt(offset) : undefined,
      orderBy: { createdAt: 'desc' }
    });

    res.json(products);
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ error: 'Error al obtener productos' });
  }
};

// Obtener un producto por ID
export const getProductById = async (req, res) => {
  try {
    const { id } = req.params;

    const product = await prisma.product.findUnique({
      where: { id }
    });

    if (!product) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }

    res.json(product);
  } catch (error) {
    console.error('Error fetching product:', error);
    res.status(500).json({ error: 'Error al obtener producto' });
  }
};

// Crear un nuevo producto (solo admin)
export const createProduct = async (req, res) => {
  try {
    const {
      name,
      description,
      priceFELI,
      priceUSD,
      category,
      stock,
      imageUrl,
      cashback
    } = req.body;

    // Validar que el usuario sea admin
    if (req.user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'No autorizado' });
    }

    const product = await prisma.product.create({
      data: {
        name,
        description,
        priceFELI: parseFloat(priceFELI),
        priceUSD: parseFloat(priceUSD),
        category,
        stock: parseInt(stock),
        imageUrl,
        cashback: parseFloat(cashback),
        isActive: true
      }
    });

    res.status(201).json(product);
  } catch (error) {
    console.error('Error creating product:', error);
    res.status(500).json({ error: 'Error al crear producto' });
  }
};

// Actualizar un producto (solo admin)
export const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Validar que el usuario sea admin
    if (req.user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'No autorizado' });
    }

    // Convertir tipos si es necesario
    if (updateData.priceFELI) updateData.priceFELI = parseFloat(updateData.priceFELI);
    if (updateData.priceUSD) updateData.priceUSD = parseFloat(updateData.priceUSD);
    if (updateData.stock) updateData.stock = parseInt(updateData.stock);
    if (updateData.cashback) updateData.cashback = parseFloat(updateData.cashback);

    const product = await prisma.product.update({
      where: { id },
      data: updateData
    });

    res.json(product);
  } catch (error) {
    console.error('Error updating product:', error);
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }
    res.status(500).json({ error: 'Error al actualizar producto' });
  }
};

// Eliminar un producto (desactivar) (solo admin)
export const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;

    // Validar que el usuario sea admin
    if (req.user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'No autorizado' });
    }

    // En lugar de eliminar, desactivamos el producto
    const product = await prisma.product.update({
      where: { id },
      data: { isActive: false }
    });

    res.json({ message: 'Producto desactivado correctamente', product });
  } catch (error) {
    console.error('Error deleting product:', error);
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }
    res.status(500).json({ error: 'Error al eliminar producto' });
  }
};

// Obtener categorías disponibles
export const getCategories = async (req, res) => {
  try {
    const categories = await prisma.product.findMany({
      where: { isActive: true },
      select: { category: true },
      distinct: ['category']
    });

    const categoryList = categories.map(c => c.category);
    res.json(categoryList);
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ error: 'Error al obtener categorías' });
  }
};

// Obtener productos destacados (más vendidos o mejor calificados)
export const getFeaturedProducts = async (req, res) => {
  try {
    const products = await prisma.product.findMany({
      where: { isActive: true },
      take: 6,
      orderBy: { createdAt: 'desc' }
    });

    res.json(products);
  } catch (error) {
    console.error('Error fetching featured products:', error);
    res.status(500).json({ error: 'Error al obtener productos destacados' });
  }
};

export default {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  getCategories,
  getFeaturedProducts
};

