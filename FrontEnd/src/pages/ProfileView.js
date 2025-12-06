import React, { useState, useEffect } from 'react';
import {
  User,
  Mail,
  Shield,
  Star,
  Award,
  TrendingUp,
  Calendar,
  CheckCircle,
  Edit,
  Camera,
  Copy,
  ExternalLink,
  Zap,
  ShoppingBag,
  Loader
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.js';
import api from '../services/api.js';
import { useNavigate } from 'react-router-dom';
import {useWeb3} from "../context/Web3Context.js";

const ProfileView = () => {
  const { user: authUser } = useAuth();
  const { account, feliBalance, isConnected } = useWeb3();
  const navigate = useNavigate();

  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalPurchases: 0,
    totalSpent: 0,
    cashbackEarned: 0,
    stakingRewards: 0,
    totalTransactions: 0
  });

  // Cargar estadísticas del usuario
  useEffect(() => {
    if (authUser) {
      loadUserStats();
    }
  }, [authUser]);

  const loadUserStats = async () => {
    try {
      setLoading(true);

      // Obtener transacciones del usuario
      const response = await api.get(`/transactions/user/${authUser.id}`, {
        params: { page: 1, limit: 1000 } // Obtener todas para calcular stats
      });

      const transactions = response.data.transactions || [];

      // Calcular estadísticas
      const purchases = transactions.filter(tx => tx.type === 'PURCHASE');
      const spent = purchases.reduce((acc, tx) => acc + parseFloat(tx.amount || 0), 0);

      const cashbackTxs = transactions.filter(tx => tx.type === 'CASHBACK' || tx.metadata?.cashback);
      const cashback = cashbackTxs.reduce((acc, tx) =>
        acc + (parseFloat(tx.amount || 0) + parseFloat(tx.metadata?.cashback || 0)), 0
      );

      const stakingRewardsTxs = transactions.filter(tx => tx.type === 'STAKING_REWARD');
      const rewards = stakingRewardsTxs.reduce((acc, tx) => acc + parseFloat(tx.amount || 0), 0);

      setStats({
        totalPurchases: purchases.length,
        totalSpent: spent,
        cashbackEarned: cashback,
        stakingRewards: rewards,
        totalTransactions: transactions.length
      });

    } catch (error) {
      console.error('Error cargando estadísticas:', error);
    } finally {
      setLoading(false);
    }
  };

  // Calcular nivel basado en transacciones y balance
  const calculateLevel = () => {
    const xp = stats.totalTransactions * 50; // 50 XP por transacción
    const balance = parseFloat(feliBalance) || 0;

    if (balance >= 10000 && xp >= 2000) {
      return {
        level: 'Platinum Member',
        xp: xp,
        nextLevelXp: 5000,
        color: 'from-purple-500 to-indigo-500'
      };
    } else if (balance >= 5000 && xp >= 1000) {
      return {
        level: 'Gold Member',
        xp: xp,
        nextLevelXp: 2000,
        color: 'from-amber-400 to-yellow-600'
      };
    } else {
      return {
        level: 'Silver Member',
        xp: xp,
        nextLevelXp: 1000,
        color: 'from-slate-400 to-slate-600'
      };
    }
  };

  const levelInfo = calculateLevel();

  // Datos del usuario con estadísticas reales
  const userData = {
    name: authUser?.nickname || authUser?.name || "Usuario",
    fullName: authUser?.name || "Usuario",
    lastName: "",
    email: authUser?.email || "tu@email.com",
    address: authUser?.walletAddress || account || "No vinculada",
    memberSince: authUser?.createdAt || new Date().toISOString(),
    level: levelInfo.level,
    xp: levelInfo.xp,
    nextLevelXp: levelInfo.nextLevelXp,
    isVerified: authUser?.isVerified || false,
    avatar: null,
    totalPurchases: stats.totalPurchases,
    totalSpent: stats.totalSpent,
    cashbackEarned: stats.cashbackEarned,
    stakingRewards: stats.stakingRewards
  };

  // Calcular logros dinámicamente
  const achievements = [
    {
      id: 1,
      name: "Primera Compra",
      description: "Realizaste tu primera compra",
      icon: ShoppingBag,
      color: "text-blue-400",
      bg: "bg-blue-500/10",
      unlocked: stats.totalPurchases >= 1
    },
    {
      id: 2,
      name: "Verificado",
      description: "Identidad verificada en blockchain",
      icon: Shield,
      color: "text-emerald-400",
      bg: "bg-emerald-500/10",
      unlocked: authUser?.isVerified || false
    },
    {
      id: 3,
      name: "Staker",
      description: "Activaste staking por primera vez",
      icon: Zap,
      color: "text-amber-400",
      bg: "bg-amber-500/10",
      unlocked: stats.stakingRewards > 0
    },
    {
      id: 4,
      name: "Gold Member",
      description: "Alcanzaste nivel Gold",
      icon: Star,
      color: "text-yellow-400",
      bg: "bg-yellow-500/10",
      unlocked: userData.level === 'Gold Member' || userData.level === 'Platinum Member'
    },
    {
      id: 5,
      name: "Comprador Frecuente",
      description: "Realiza 50 compras",
      icon: Award,
      color: "text-purple-400",
      bg: "bg-purple-500/10",
      unlocked: stats.totalPurchases >= 50
    },
    {
      id: 6,
      name: "Ballena",
      description: "Gasta más de 100,000 FELICOINS",
      icon: TrendingUp,
      color: "text-rose-400",
      bg: "bg-rose-500/10",
      unlocked: stats.totalSpent >= 100000
    }
  ];

  const copyAddress = () => {
    navigator.clipboard.writeText(userData.address);
    alert('Dirección copiada al portapapeles');
  };

  const formatNum = (num) => new Intl.NumberFormat('en-US').format(num);

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white mb-1">Mi Perfil</h1>
        <p className="text-slate-400">Gestiona tu información y progreso</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Columna Izquierda - Info Personal */}
        <div className="lg:col-span-1 space-y-6">
          {/* Avatar y Nivel */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
            <div className="flex flex-col items-center text-center">
              {/* Avatar */}
              <div className="relative mb-4">
                <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-amber-400 to-orange-600 flex items-center justify-center text-4xl font-bold text-white">
                  {userData.name[0]}{userData.lastName[0]}
                </div>
                <button className="absolute bottom-0 right-0 w-8 h-8 bg-amber-500 rounded-full flex items-center justify-center hover:bg-amber-400 transition-colors">
                  <Camera size={16} className="text-slate-900" />
                </button>
              </div>

              {/* Nombre */}
              <h2 className="text-2xl font-bold text-white mb-1">
                {userData.name} {userData.lastName}
              </h2>

              {/* Nivel Badge */}
              <div className="flex items-center gap-2 mb-4">
                <div className="px-3 py-1 bg-amber-500/10 border border-amber-500/20 rounded-full flex items-center gap-2">
                  <Star className="text-amber-500" size={14} fill="currentColor" />
                  <span className="text-amber-500 font-bold text-sm">{userData.level}</span>
                </div>
                {userData.isVerified && (
                  <div className="px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full flex items-center gap-2">
                    <CheckCircle className="text-emerald-400" size={14} />
                    <span className="text-emerald-400 font-bold text-sm">Verificado</span>
                  </div>
                )}
              </div>

              {/* Progreso de Nivel */}
              <div className="w-full">
                <div className="flex justify-between text-xs font-bold mb-2">
                  <span className="text-slate-400">Progreso</span>
                  <span className="text-amber-500">{userData.xp} / {userData.nextLevelXp} XP</span>
                </div>
                <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-amber-500 to-orange-600 rounded-full transition-all duration-500"
                    style={{ width: `${(userData.xp / userData.nextLevelXp) * 100}%` }}
                  ></div>
                </div>
                <p className="text-xs text-slate-500 mt-2">
                  {userData.nextLevelXp - userData.xp} XP para el siguiente nivel
                </p>
              </div>
            </div>
          </div>

          {/* Info de Contacto */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-white">Información</h3>
              <button
                onClick={() => setIsEditing(!isEditing)}
                className="text-amber-500 hover:text-amber-400 transition-colors"
              >
                <Edit size={18} />
              </button>
            </div>

            <div className="space-y-4">
              {/* Email */}
              <div>
                <div className="flex items-center gap-2 text-slate-400 text-sm mb-1">
                  <Mail size={14} />
                  <span>Email</span>
                </div>
                <p className="text-white font-medium">{userData.email}</p>
              </div>

              {/* Wallet Address */}
              <div>
                <div className="flex items-center gap-2 text-slate-400 text-sm mb-1">
                  <Shield size={14} />
                  <span>Wallet</span>
                </div>
                <div className="flex items-center gap-2">
                  <p className="text-white font-mono text-sm truncate">
                    {userData.address.slice(0, 10)}...{userData.address.slice(-8)}
                  </p>
                  <button onClick={copyAddress} className="text-slate-400 hover:text-white transition-colors">
                    <Copy size={14} />
                  </button>
                  <a
                    href={`https://etherscan.io/address/${userData.address}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-slate-400 hover:text-white transition-colors"
                  >
                    <ExternalLink size={14} />
                  </a>
                </div>
              </div>

              {/* Member Since */}
              <div>
                <div className="flex items-center gap-2 text-slate-400 text-sm mb-1">
                  <Calendar size={14} />
                  <span>Miembro desde</span>
                </div>
                <p className="text-white font-medium">
                  {new Date(userData.memberSince).toLocaleDateString('es-ES', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric'
                  })}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Columna Derecha - Estadísticas y Logros */}
        <div className="lg:col-span-2 space-y-6">
          {/* Estadísticas */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
              <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center mb-3">
                <ShoppingBag className="text-purple-400" size={20} />
              </div>
              <p className="text-slate-400 text-xs mb-1">Compras</p>
              {loading ? (
                <Loader className="animate-spin text-slate-600" size={24} />
              ) : (
                <h3 className="text-2xl font-bold text-white">{userData.totalPurchases}</h3>
              )}
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
              <div className="w-10 h-10 rounded-xl bg-rose-500/10 flex items-center justify-center mb-3">
                <TrendingUp className="text-rose-400" size={20} />
              </div>
              <p className="text-slate-400 text-xs mb-1">Gastado</p>
              {loading ? (
                <Loader className="animate-spin text-slate-600" size={24} />
              ) : (
                <>
                  <h3 className="text-xl font-bold text-white">{formatNum(userData.totalSpent)}</h3>
                  <p className="text-xs text-slate-500">FELICOINS</p>
                </>
              )}
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center mb-3">
                <Zap className="text-emerald-400" size={20} />
              </div>
              <p className="text-slate-400 text-xs mb-1">Cashback</p>
              {loading ? (
                <Loader className="animate-spin text-slate-600" size={24} />
              ) : (
                <>
                  <h3 className="text-xl font-bold text-white">{formatNum(userData.cashbackEarned)}</h3>
                  <p className="text-xs text-slate-500">FELICOINS</p>
                </>
              )}
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center mb-3">
                <Award className="text-blue-400" size={20} />
              </div>
              <p className="text-slate-400 text-xs mb-1">Staking</p>
              {loading ? (
                <Loader className="animate-spin text-slate-600" size={24} />
              ) : (
                <>
                  <h3 className="text-xl font-bold text-white">{formatNum(userData.stakingRewards)}</h3>
                  <p className="text-xs text-slate-500">FELICOINS</p>
                </>
              )}
            </div>
          </div>

          {/* Logros */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
            <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              <Award className="text-amber-500" size={24} />
              Logros Desbloqueados ({achievements.filter(a => a.unlocked).length}/{achievements.length})
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {achievements.map((achievement) => (
                <div
                  key={achievement.id}
                  className={`p-4 rounded-xl border transition-all ${
                    achievement.unlocked 
                      ? `${achievement.bg} ${achievement.color} border-current/20` 
                      : 'bg-slate-950/50 border-slate-800 opacity-50'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`w-12 h-12 rounded-xl ${achievement.unlocked ? achievement.bg : 'bg-slate-800'} flex items-center justify-center shrink-0`}>
                      <achievement.icon
                        className={achievement.unlocked ? achievement.color : 'text-slate-600'}
                        size={24}
                      />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className={`font-bold ${achievement.unlocked ? 'text-white' : 'text-slate-600'}`}>
                          {achievement.name}
                        </h4>
                        {achievement.unlocked && (
                          <CheckCircle className="text-emerald-400" size={14} />
                        )}
                      </div>
                      <p className={`text-sm ${achievement.unlocked ? 'text-slate-400' : 'text-slate-600'}`}>
                        {achievement.description}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Acciones Rápidas */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
            <h3 className="text-xl font-bold text-white mb-4">Acciones Rápidas</h3>
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => {
                  // Usar el evento customizado para cambiar de vista
                  window.dispatchEvent(new CustomEvent('changeView', { detail: 'settings' }));
                }}
                className="px-4 py-3 bg-gradient-to-r from-amber-500 to-orange-600 text-slate-900 font-bold rounded-xl hover:shadow-lg hover:shadow-amber-500/20 transition-all"
              >
                Editar Perfil
              </button>
              <button
                onClick={() => {
                  window.dispatchEvent(new CustomEvent('changeView', { detail: 'settings' }));
                }}
                className="px-4 py-3 bg-slate-950 border border-slate-800 text-white font-medium rounded-xl hover:border-slate-600 transition-colors"
              >
                Ajustes
              </button>
              <button
                onClick={() => {
                  window.dispatchEvent(new CustomEvent('changeView', { detail: 'wallet' }));
                }}
                className="px-4 py-3 bg-slate-950 border border-slate-800 text-white font-medium rounded-xl hover:border-slate-600 transition-colors"
              >
                Ver Billetera
              </button>
              <button
                onClick={() => {
                  window.dispatchEvent(new CustomEvent('changeView', { detail: 'history' }));
                }}
                className="px-4 py-3 bg-slate-950 border border-slate-800 text-white font-medium rounded-xl hover:border-slate-600 transition-colors"
              >
                Ver Historial
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};


export default ProfileView;

