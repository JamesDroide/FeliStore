import React, { createContext, useState, useContext, useEffect } from 'react';
import { login as apiLogin, register as apiRegister, verifySession } from '../services/api';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Verificar sesión al cargar
  useEffect(() => {
    const checkSession = async () => {
      const userEmail = localStorage.getItem('userEmail');

      if (userEmail) {
        try {
          const response = await verifySession(userEmail);
          if (response.success) {
            setUser(response.user);
            setIsAuthenticated(true);
          }
        } catch (error) {
          console.error('Session verification failed:', error);
          localStorage.removeItem('userEmail');
          localStorage.removeItem('userData');
        }
      }

      setLoading(false);
    };

    checkSession();
  }, []);

  // Login
  const login = async (email, password) => {
    try {
      setLoading(true);
      const response = await apiLogin(email, password);

      if (response.success) {
        setUser(response.user);
        setIsAuthenticated(true);
        localStorage.setItem('userEmail', email);
        localStorage.setItem('userData', JSON.stringify(response.user));

        // Guardar token JWT si existe
        if (response.token) {
          localStorage.setItem('authToken', response.token);
          console.log('✅ Token guardado en localStorage');
        }

        return { success: true, user: response.user };
      }

      return { success: false, error: 'Login failed' };
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: error.response?.data?.error || 'Login failed' };
    } finally {
      setLoading(false);
    }
  };

  // Register
  const register = async (userData) => {
    try {
      setLoading(true);
      const response = await apiRegister(userData);

      if (response.success) {
        // Después de registrar, hacer login automático
        const loginResult = await login(userData.email, userData.password);
        return loginResult;
      }

      return { success: false, error: 'Registration failed' };
    } catch (error) {
      console.error('Register error:', error);
      return {
        success: false,
        error: error.response?.data?.error || 'Registration failed'
      };
    } finally {
      setLoading(false);
    }
  };

  // Logout
  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userData');
    localStorage.removeItem('authToken');
    console.log('✅ Sesión cerrada y token eliminado');
  };

  // Update user data
  const updateUserData = (newData) => {
    const updatedUser = { ...user, ...newData };
    setUser(updatedUser);
    localStorage.setItem('userData', JSON.stringify(updatedUser));
  };

  const value = {
    user,
    loading,
    isAuthenticated,
    login,
    register,
    logout,
    updateUserData
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;

