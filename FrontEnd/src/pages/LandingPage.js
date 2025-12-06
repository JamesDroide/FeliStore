import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ShoppingBag, Gift, Users, Shield } from 'lucide-react';

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-slate-950 relative overflow-hidden">
      {/* Efectos de fondo */}
      <div className="fixed top-[-20%] left-[-10%] w-[40%] h-[40%] bg-amber-600/10 rounded-full blur-[150px] pointer-events-none"></div>
      <div className="fixed bottom-[-10%] right-[-10%] w-[30%] h-[30%] bg-orange-600/10 rounded-full blur-[150px] pointer-events-none"></div>

      {/* Navbar */}
      <nav className="relative z-10 flex items-center justify-between p-6 md:p-8">
        <div className="flex items-center gap-3">
          <img src="/Felimarket.png" alt="Felimarket" className="h-10 w-auto" />
        </div>
        <div className="flex items-center gap-4">
          <Link
            to="/login"
            className="px-4 py-2 text-slate-300 hover:text-white transition-colors font-medium"
          >
            Iniciar Sesión
          </Link>
          <Link
            to="/register"
            className="px-6 py-2 bg-gradient-to-r from-amber-500 to-orange-600 text-slate-900 font-bold rounded-xl hover:shadow-lg hover:shadow-amber-500/20 transition-all"
          >
            Registrarse
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="relative z-10 max-w-6xl mx-auto px-6 py-20 md:py-32 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-amber-500/10 border border-amber-500/20 rounded-full text-amber-400 text-sm font-medium mb-8">
          <ShoppingBag size={16} />
          <span>Plataforma Web3 de E-commerce</span>
        </div>

        <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
          Compra, Gana y<br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-500">
            Gobierna
          </span>{' '}
          tu Tienda
        </h1>

        <p className="text-xl text-slate-400 mb-12 max-w-2xl mx-auto">
          La primera plataforma que combina e-commerce tradicional con las ventajas de blockchain.
          Gana cashback en cada compra, participa en la gobernanza y accede a eventos exclusivos.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            to="/register"
            className="px-8 py-4 bg-gradient-to-r from-amber-500 to-orange-600 text-slate-900 font-bold rounded-xl hover:shadow-lg hover:shadow-amber-500/20 transition-all flex items-center justify-center gap-2"
          >
            Empezar Ahora
            <ArrowRight size={20} />
          </Link>
          <Link
            to="/login"
            className="px-8 py-4 bg-slate-900 border border-slate-800 text-white font-medium rounded-xl hover:border-slate-600 transition-colors"
          >
            Ver Demo
          </Link>
        </div>
      </div>

      {/* Features Section */}
      <div className="relative z-10 max-w-6xl mx-auto px-6 py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Feature 1 */}
          <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl hover:border-amber-500/30 transition-colors">
            <div className="w-12 h-12 bg-amber-500/10 rounded-xl flex items-center justify-center mb-4">
              <ShoppingBag size={24} className="text-amber-500" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Marketplace Web3</h3>
            <p className="text-sm text-slate-400">
              Compra productos físicos y digitales pagando con Felicoins o criptomonedas.
            </p>
          </div>

          {/* Feature 2 */}
          <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl hover:border-amber-500/30 transition-colors">
            <div className="w-12 h-12 bg-emerald-500/10 rounded-xl flex items-center justify-center mb-4">
              <Gift size={24} className="text-emerald-500" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Cashback y Staking</h3>
            <p className="text-sm text-slate-400">
              Gana hasta 20% en cashback y obtén APY del 5.4% haciendo staking.
            </p>
          </div>

          {/* Feature 3 */}
          <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl hover:border-amber-500/30 transition-colors">
            <div className="w-12 h-12 bg-purple-500/10 rounded-xl flex items-center justify-center mb-4">
              <Users size={24} className="text-purple-500" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Gobernanza DAO</h3>
            <p className="text-sm text-slate-400">
              Participa en decisiones importantes de la plataforma con tu voto.
            </p>
          </div>

          {/* Feature 4 */}
          <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl hover:border-amber-500/30 transition-colors">
            <div className="w-12 h-12 bg-blue-500/10 rounded-xl flex items-center justify-center mb-4">
              <Shield size={24} className="text-blue-500" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Identidad Web3</h3>
            <p className="text-sm text-slate-400">
              Verifica tu identidad de forma descentralizada y segura.
            </p>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="relative z-10 max-w-4xl mx-auto px-6 py-20 mb-20">
        <div className="p-12 bg-gradient-to-br from-slate-900 via-slate-900 to-indigo-950 border border-slate-800 rounded-3xl text-center relative overflow-hidden">
          <div className="absolute right-0 top-0 w-64 h-64 bg-amber-500/10 blur-[80px] rounded-full"></div>

          <div className="relative z-10">
            <h2 className="text-4xl font-bold text-white mb-4">
              ¿Listo para empezar?
            </h2>
            <p className="text-slate-400 mb-8 max-w-xl mx-auto">
              Únete a miles de usuarios que ya están ganando recompensas y participando en la economía Web3.
            </p>
            <Link
              to="/register"
              className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-amber-500 to-orange-600 text-slate-900 font-bold rounded-xl hover:shadow-lg hover:shadow-amber-500/20 transition-all"
            >
              Crear Cuenta Gratis
              <ArrowRight size={20} />
            </Link>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="relative z-10 border-t border-slate-800 py-8">
        <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <img src="/Felimarket.png" alt="Felimarket" className="h-8 w-auto" />
          </div>
          <p className="text-slate-500 text-sm">
            © 2025 Felimarket. Todos los derechos reservados.
          </p>
          <div className="flex gap-6 text-sm text-slate-400">
            <a href="#" className="hover:text-white transition-colors">Términos</a>
            <a href="#" className="hover:text-white transition-colors">Privacidad</a>
            <a href="#" className="hover:text-white transition-colors">Soporte</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;

