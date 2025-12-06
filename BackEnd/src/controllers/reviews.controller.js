// reviews.controller.js - Controlador para reseñas de productos
import prisma from '../config/database.js';

// Obtener reseñas de un producto
export const getProductReviews = async (req, res) => {
  try {
    const { productId } = req.params;
    const { limit = 10, offset = 0 } = req.query;

    const reviews = await prisma.review.findMany({
      where: { productId },
      include: {
        user: {
          select: {
            id: true,
            nickname: true,
            name: true
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: parseInt(limit),
      skip: parseInt(offset)
    });

    // Calcular rating promedio
    const avgRating = await prisma.review.aggregate({
      where: { productId },
      _avg: { rating: true },
      _count: true
    });

    res.json({
      reviews,
      averageRating: avgRating._avg.rating || 0,
      totalReviews: avgRating._count
    });
  } catch (error) {
    console.error('Error fetching reviews:', error);
    res.status(500).json({ error: 'Error al obtener reseñas' });
  }
};

// Crear una reseña
export const createReview = async (req, res) => {
  try {
    const { productId, rating, comment } = req.body;
    const userId = req.user.id;

    // Validar que el rating esté entre 1 y 5
    if (rating < 1 || rating > 5) {
      return res.status(400).json({ error: 'El rating debe estar entre 1 y 5' });
    }

    // Verificar que el producto existe
    const product = await prisma.product.findUnique({
      where: { id: productId }
    });

    if (!product) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }

    // Verificar que el usuario no haya dejado ya una reseña
    const existingReview = await prisma.review.findFirst({
      where: {
        productId,
        userId
      }
    });

    if (existingReview) {
      return res.status(400).json({ error: 'Ya has dejado una reseña para este producto' });
    }

    // Verificar si el usuario compró el producto
    const hasPurchased = await prisma.transaction.findFirst({
      where: {
        userId,
        productId,
        type: 'PURCHASE',
        status: 'CONFIRMED'
      }
    });

    const review = await prisma.review.create({
      data: {
        productId,
        userId,
        rating: parseInt(rating),
        comment,
        isVerified: !!hasPurchased
      },
      include: {
        user: {
          select: {
            id: true,
            nickname: true,
            name: true
          }
        }
      }
    });

    res.status(201).json(review);
  } catch (error) {
    console.error('Error creating review:', error);
    res.status(500).json({ error: 'Error al crear reseña' });
  }
};

// Actualizar una reseña
export const updateReview = async (req, res) => {
  try {
    const { id } = req.params;
    const { rating, comment } = req.body;
    const userId = req.user.id;

    // Verificar que la reseña existe y pertenece al usuario
    const review = await prisma.review.findUnique({
      where: { id }
    });

    if (!review) {
      return res.status(404).json({ error: 'Reseña no encontrada' });
    }

    if (review.userId !== userId) {
      return res.status(403).json({ error: 'No autorizado para editar esta reseña' });
    }

    // Validar rating si se proporciona
    if (rating && (rating < 1 || rating > 5)) {
      return res.status(400).json({ error: 'El rating debe estar entre 1 y 5' });
    }

    const updatedReview = await prisma.review.update({
      where: { id },
      data: {
        ...(rating && { rating: parseInt(rating) }),
        ...(comment !== undefined && { comment })
      },
      include: {
        user: {
          select: {
            id: true,
            nickname: true,
            name: true
          }
        }
      }
    });

    res.json(updatedReview);
  } catch (error) {
    console.error('Error updating review:', error);
    res.status(500).json({ error: 'Error al actualizar reseña' });
  }
};

// Eliminar una reseña
export const deleteReview = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Verificar que la reseña existe
    const review = await prisma.review.findUnique({
      where: { id }
    });

    if (!review) {
      return res.status(404).json({ error: 'Reseña no encontrada' });
    }

    // Solo el autor o un admin pueden eliminar
    if (review.userId !== userId && req.user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'No autorizado para eliminar esta reseña' });
    }

    await prisma.review.delete({
      where: { id }
    });

    res.json({ message: 'Reseña eliminada correctamente' });
  } catch (error) {
    console.error('Error deleting review:', error);
    res.status(500).json({ error: 'Error al eliminar reseña' });
  }
};

// Obtener mis reseñas
export const getMyReviews = async (req, res) => {
  try {
    const userId = req.user.id;

    const reviews = await prisma.review.findMany({
      where: { userId },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            imageUrl: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json(reviews);
  } catch (error) {
    console.error('Error fetching user reviews:', error);
    res.status(500).json({ error: 'Error al obtener reseñas del usuario' });
  }
};

export default {
  getProductReviews,
  createReview,
  updateReview,
  deleteReview,
  getMyReviews
};

