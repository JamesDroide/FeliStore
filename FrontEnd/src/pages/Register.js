import React, { useState } from 'react';
import { Eye, EyeOff, Mail, User, Lock, ArrowRight, AlertCircle, CheckCircle, Loader } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.js';

const Register = () => {
  const navigate = useNavigate();
  const { register, loading: authLoading } = useAuth();

  const [formData, setFormData] = useState({
    name: '',
    nickname: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
  };

  const validateForm = () => {
    if (!formData.name || !formData.nickname || !formData.email || !formData.password || !formData.confirmPassword) {
      setError('Todos los campos son requeridos');
      return false;
    }

    if (!/\S+@\S+\.\S+/.test(formData.email)) {
      setError('Email inválido');
      return false;
    }

    if (formData.password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres');
      return false;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Las contraseñas no coinciden');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    if (!validateForm()) {
      setIsLoading(false);
      return;
    }

    try {
      const result = await register({
        name: formData.name,
        nickname: formData.nickname,
        email: formData.email,
        password: formData.password
      });

      if (result.success) {
        // Redirigir al dashboard después del registro exitoso
        navigate('/dashboard');
      } else {
        setError(result.error || 'Error al registrarse');
      }
    } catch (err) {
      setError('Error de conexión. Por favor intenta de nuevo.');
      console.error('Register error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const getPasswordStrength = () => {
    const password = formData.password;
    if (!password) return { strength: 0, text: '', color: 'bg-slate-700' };

    let strength = 0;
    if (password.length >= 6) strength++;
    if (password.length >= 8) strength++;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++;
    if (/\d/.test(password)) strength++;
    if (/[^a-zA-Z0-9]/.test(password)) strength++;

    if (strength <= 2) return { strength: 33, text: 'Débil', color: 'bg-rose-500' };
    if (strength <= 3) return { strength: 66, text: 'Media', color: 'bg-amber-500' };
    return { strength: 100, text: 'Fuerte', color: 'bg-emerald-500' };
  };

  const passwordStrength = getPasswordStrength();

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
          <h1 className="text-3xl font-bold text-white mb-2">Crear cuenta</h1>
          <p className="text-slate-400">Únete a la plataforma Web3 de comercio</p>
        </div>

        {/* Card de registro */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-2xl">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Nombre */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Nombre completo
              </label>
              <div className="relative">
                <User className="absolute left-3 top-3 text-slate-500" size={20} />
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Tu nombre"
                  disabled={isLoading || authLoading}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 pl-10 pr-4 text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 transition-colors disabled:opacity-50"
                />
              </div>
            </div>

            {/* Apodo/Nickname */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Apodo
              </label>
              <div className="relative">
                <User className="absolute left-3 top-3 text-slate-500" size={20} />
                <input
                  type="text"
                  name="nickname"
                  value={formData.nickname}
                  onChange={handleChange}
                  placeholder="Tu apodo"
                  disabled={isLoading || authLoading}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 pl-10 pr-4 text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 transition-colors disabled:opacity-50"
                />
              </div>
            </div>

            {/* Email */}
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
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 pl-10 pr-4 text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 transition-colors disabled:opacity-50"
                />
              </div>
            </div>

            {/* Contraseña */}
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
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 pl-10 pr-12 text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 transition-colors disabled:opacity-50"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-slate-500 hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>

              {/* Indicador de fortaleza */}
              {formData.password && (
                <div className="mt-2">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs text-slate-400">Fortaleza:</span>
                    <span className={`text-xs font-medium ${passwordStrength.color.replace('bg-', 'text-')}`}>
                      {passwordStrength.text}
                    </span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${passwordStrength.color} transition-all duration-300`}
                      style={{ width: `${passwordStrength.strength}%` }}
                    ></div>
                  </div>
                </div>
              )}
            </div>

            {/* Confirmar Contraseña */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Confirmar contraseña
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 text-slate-500" size={20} />
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="••••••••"
                  disabled={isLoading || authLoading}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 pl-10 pr-12 text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 transition-colors disabled:opacity-50"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-3 text-slate-500 hover:text-white transition-colors"
                >
                  {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
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

            {/* Info */}
            <div className="flex items-start gap-2 p-3 bg-blue-500/10 border border-blue-500/20 rounded-xl">
              <CheckCircle size={18} className="text-blue-400 shrink-0 mt-0.5" />
              <p className="text-xs text-blue-400">
                Podrás vincular tu wallet de MetaMask más tarde desde las configuraciones.
              </p>
            </div>

            {/* Botón de submit */}
            <button
              type="submit"
              disabled={isLoading || authLoading}
              className="w-full py-3 bg-gradient-to-r from-amber-500 to-orange-600 text-slate-900 font-bold rounded-xl hover:shadow-lg hover:shadow-amber-500/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading || authLoading ? (
                <>
                  <Loader size={20} className="animate-spin" />
                  Registrando...
                </>
              ) : (
                <>
                  Crear cuenta
                  <ArrowRight size={20} />
                </>
              )}
            </button>
          </form>

          {/* Link a login */}
          <div className="mt-6 text-center">
            <p className="text-slate-400 text-sm">
              ¿Ya tienes una cuenta?{' '}
              <Link to="/login" className="text-amber-500 font-bold hover:text-amber-400 transition-colors">
                Inicia sesión
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

export default Register;

