import { useState, useEffect } from 'react';
import { getUserByWallet, getUserTransactions } from '../services/api';

/**
 * Hook para obtener datos del usuario desde la API
 * @param {string} walletAddress - Dirección de la wallet
 * @returns {object} { user, transactions, loading, error, refetch }
 */
export const useUser = (walletAddress) => {
  const [user, setUser] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchUserData = async () => {
    if (!walletAddress) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Obtener datos del usuario
      const userData = await getUserByWallet(walletAddress);
      setUser(userData.user || null);

      // Obtener transacciones del usuario
      const txData = await getUserTransactions(walletAddress);
      setTransactions(txData.transactions || []);
    } catch (err) {
      setError(err.message || 'Error al cargar datos del usuario');
      console.error('Error loading user data:', err);
      setUser(null);
      setTransactions([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserData();
  }, [walletAddress]);

  return {
    user,
    transactions,
    loading,
    error,
    refetch: fetchUserData
  };
};

export default useUser;

