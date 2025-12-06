import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import LandingPage from './pages/LandingPage.js';
import Login from './pages/Login.js';
import Register from './pages/Register.js';
import App from './App.js';

const Router = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Página de inicio */}
        <Route path="/" element={<LandingPage />} />

        {/* Rutas de autenticación */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Dashboard principal (requiere autenticación) */}
        <Route path="/dashboard" element={<App />} />

        {/* Ruta 404 */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default Router;

