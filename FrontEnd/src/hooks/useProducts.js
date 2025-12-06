import { useState, useEffect } from 'react';
import { getProducts } from '../services/api';

/**
 * Hook para obtener productos desde la API
 * @param {string} category - Categoría de productos (opcional)
 * @returns {object} { products, loading, error, refetch }
 */
export const useProducts = (category = null) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getProducts(category);
      // La API devuelve directamente un array, no un objeto con products
      setProducts(Array.isArray(data) ? data : (data.products || []));
    } catch (err) {
      setError(err.message || 'Error al cargar productos');
      console.error('Error loading products:', err);
      // Mantener productos vacíos en caso de error
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [category]);

  return {
    products,
    loading,
    error,
    refetch: fetchProducts
  };
};

export default useProducts;

