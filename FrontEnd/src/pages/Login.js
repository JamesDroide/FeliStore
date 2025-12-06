import React, { useState } from 'react';
import { Eye, EyeOff, Mail, Lock, ArrowRight, AlertCircle, Loader } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.js';

const Login = () => {
  const navigate = useNavigate();
  const { login, loading: authLoading } = useAuth();

  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    // Validación básica
    if (!formData.email || !formData.password) {
      setError('Por favor completa todos los campos');
      setIsLoading(false);
      return;
    }

    // Validar formato de email
    if (!/\S+@\S+\.\S+/.test(formData.email)) {
      setError('Por favor ingresa un email válido');
      setIsLoading(false);
      return;
    }

    try {
      const result = await login(formData.email, formData.password);

      if (result.success) {
        // Redirigir al dashboard
        navigate('/dashboard');
      } else {
        setError(result.error || 'Credenciales incorrectas');
      }
    } catch (err) {
      setError('Error de conexión. Por favor intenta de nuevo.');
      console.error('Login error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Fondo con efectos */}
      <div className="fixed top-[-20%] left-[-10%] w-[40%] h-[40%] bg-amber-600/10 rounded-full blur-[150px] pointer-events-none"></div>
      <div className="fixed bottom-[-10%] right-[-10%] w-[30%] h-[30%] bg-orange-600/10 rounded-full blur-[150px] pointer-events-none"></div>

      {/* Container principal */}
      <div className="w-full max-w-md relative z-10">
        {/* Logo y título */}
        <div className="text-center mb-8">
          <img src="/Felimarket.png" alt="Felimarket" className="h-12 mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-white mb-2">Bienvenido de vuelta</h1>
          <p className="text-slate-400">Inicia sesión para continuar</p>
        </div>

        {/* Card de login */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-2xl">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Campo de Email */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 text-slate-500" size={20} />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="tu@email.com"
                  disabled={isLoading || authLoading}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 pl-10 pr-4 text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                />
              </div>
            </div>

            {/* Campo de Password */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Contraseña
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 text-slate-500" size={20} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  disabled={isLoading || authLoading}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 pl-10 pr-12 text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-slate-500 hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            {/* Mensaje de error */}
            {error && (
              <div className="flex items-center gap-2 p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl">
                <AlertCircle size={18} className="text-rose-400 shrink-0" />
                <p className="text-sm text-rose-400">{error}</p>
              </div>
            )}

            {/* Botón de submit */}
            <button
              type="submit"
              disabled={isLoading || authLoading}
              className="w-full py-3 bg-gradient-to-r from-amber-500 to-orange-600 text-slate-900 font-bold rounded-xl hover:shadow-lg hover:shadow-amber-500/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading || authLoading ? (
                <>
                  <Loader size={20} className="animate-spin" />
                  Iniciando sesión...
                </>
              ) : (
                <>
                  Iniciar sesión
                  <ArrowRight size={20} />
                </>
              )}
            </button>
          </form>

          {/* Link a registro */}
          <div className="mt-6 text-center">
            <p className="text-slate-400 text-sm">
              ¿No tienes una cuenta?{' '}
              <Link to="/register" className="text-amber-500 font-bold hover:text-amber-400 transition-colors">
                Regístrate aquí
              </Link>
            </p>
          </div>
        </div>

        {/* Link a home */}
        <div className="mt-6 text-center">
          <Link to="/" className="text-slate-500 text-sm hover:text-white transition-colors">
            ← Volver al inicio
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;

