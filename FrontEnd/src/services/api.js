import axios from 'axios';

// URL base de la API
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Crear instancia de axios
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  },
  timeout: 10000 // 10 segundos
});

// Interceptor para agregar wallet address y token JWT
api.interceptors.request.use(
  (config) => {
    // Agregar wallet address si existe
    const address = localStorage.getItem('walletAddress');
    if (address) {
      config.headers['X-Wallet-Address'] = address;
    }

    // Agregar token JWT si existe
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para manejar errores
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error.response?.data || error.message);

    // Mostrar notificación de error al usuario
    if (error.response?.status === 404) {
      console.warn('Recurso no encontrado');
    } else if (error.response?.status === 500) {
      console.error('Error del servidor');
    } else if (error.code === 'ECONNREFUSED') {
      console.error('No se puede conectar con el servidor. ¿Está corriendo el backend?');
    }

    return Promise.reject(error);
  }
);

// ==================== PRODUCTOS ====================

export const getProducts = async (category = null) => {
  try {
    const params = category ? { category } : {};
    const response = await api.get('/products', { params });
    return response.data;
  } catch (error) {
    console.error('Error fetching products:', error);
    throw error;
  }
};

export const getProductById = async (id) => {
  try {
    const response = await api.get(`/products/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching product:', error);
    throw error;
  }
};

// ==================== USUARIOS ====================

export const getUserByWallet = async (address) => {
  try {
    const response = await api.get(`/users/${address}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching user:', error);
    throw error;
  }
};

export const updateUser = async (userId, data) => {
  try {
    const response = await api.put(`/users/profile/${userId}`, data);
    return response.data;
  } catch (error) {
    console.error('Error updating user:', error);
    throw error;
  }
};

export const verifyIdentity = async (address) => {
  try {
    const response = await api.post(`/users/${address}/verify`);
    return response.data;
  } catch (error) {
    console.error('Error verifying identity:', error);
    throw error;
  }
};

export const getVerificationStatus = async (address) => {
  try {
    const response = await api.get(`/users/${address}/verification`);
    return response.data;
  } catch (error) {
    console.error('Error fetching verification status:', error);
    throw error;
  }
};

export const getUserTransactions = async (address, type = null) => {
  try {
    const params = type ? { type } : {};
    const response = await api.get(`/users/${address}/transactions`, { params });
    return response.data;
  } catch (error) {
    console.error('Error fetching user transactions:', error);
    throw error;
  }
};

// ==================== AUTENTICACIÓN ====================

export const register = async (userData) => {
  try {
    const response = await api.post('/auth/register', userData);
    return response.data;
  } catch (error) {
    console.error('Error registering:', error);
    throw error;
  }
};

export const login = async (email, password) => {
  try {
    const response = await api.post('/auth/login', { email, password });
    return response.data;
  } catch (error) {
    console.error('Error logging in:', error);
    throw error;
  }
};

export const linkWallet = async (userId, walletAddress) => {
  try {
    const response = await api.post('/auth/link-wallet', { userId, walletAddress });
    return response.data;
  } catch (error) {
    console.error('Error linking wallet:', error);
    throw error;
  }
};

export const verifySession = async (email) => {
  try {
    const response = await api.get(`/auth/verify/${email}`);
    return response.data;
  } catch (error) {
    console.error('Error verifying session:', error);
    throw error;
  }
};

// ==================== CUPONES ====================

export const getAvailableCoupons = async () => {
  try {
    const response = await api.get('/coupons/available');
    return response.data;
  } catch (error) {
    console.error('Error obteniendo cupones:', error);
    throw error;
  }
};

export const getUserCoupons = async (userId) => {
  try {
    const response = await api.get(`/coupons/user/${userId}`);
    return response.data;
  } catch (error) {
    console.error('Error obteniendo cupones del usuario:', error);
    throw error;
  }
};

export const redeemCoupon = async (couponId, userId) => {
  try {
    const response = await api.post(`/coupons/redeem/${couponId}`, { userId });
    return response.data;
  } catch (error) {
    console.error('Error canjeando cupón:', error);
    throw error;
  }
};

export const useCoupon = async (userCouponId, purchaseId) => {
  try {
    const response = await api.post('/coupons/use', { userCouponId, purchaseId });
    return response.data;
  } catch (error) {
    console.error('Error usando cupón:', error);
    throw error;
  }
};

// ==================== MEMBRESÍA ====================

export const getUserMembership = async (userId) => {
  try {
    const response = await api.get(`/membership/${userId}`);
    return response.data;
  } catch (error) {
    console.error('Error obteniendo membresía:', error);
    throw error;
  }
};

export const updateUserXP = async (userId, xpToAdd) => {
  try {
    const response = await api.post(`/membership/${userId}/xp`, { xpToAdd });
    return response.data;
  } catch (error) {
    console.error('Error actualizando XP:', error);
    throw error;
  }
};

export const getMembershipBenefits = async (userId) => {
  try {
    const response = await api.get(`/membership/${userId}/benefits`);
    return response.data;
  } catch (error) {
    console.error('Error obteniendo beneficios:', error);
    throw error;
  }
};

// ==================== EVENTOS NFT ====================

export const getAvailableEvents = async () => {
  try {
    const response = await api.get('/events/available');
    return response.data;
  } catch (error) {
    console.error('Error obteniendo eventos:', error);
    throw error;
  }
};

export const getEventById = async (eventId) => {
  try {
    const response = await api.get(`/events/${eventId}`);
    return response.data;
  } catch (error) {
    console.error('Error obteniendo evento:', error);
    throw error;
  }
};

export const buyEventTicket = async (eventId, userId, txHash) => {
  try {
    const response = await api.post(`/events/${eventId}/buy`, { userId, txHash });
    return response.data;
  } catch (error) {
    console.error('Error comprando ticket:', error);
    throw error;
  }
};

export const getUserTickets = async (userId) => {
  try {
    const response = await api.get(`/events/user/${userId}/tickets`);
    return response.data;
  } catch (error) {
    console.error('Error obteniendo tickets:', error);
    throw error;
  }
};

// ==================== HEALTH CHECK ====================

export const checkApiHealth = async () => {
  try {
    const response = await axios.get('http://localhost:5000/health');
    return response.data;
  } catch (error) {
    console.error('Backend no disponible:', error);
    return null;
  }
};

export default api;

