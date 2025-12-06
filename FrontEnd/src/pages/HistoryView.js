import React, { useState, useEffect } from 'react';
import {
  History,
  ArrowUpRight,
  ArrowDownLeft,
  ShoppingBag,
  Zap,
  Gift,
  Filter,
  Calendar,
  ExternalLink,
  Download,
  Search,
  Loader
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.js';
import api from '../services/api.js';
import {useWeb3} from "../context/Web3Context.js";

const HistoryView = () => {
  const { user } = useAuth();
  const { account, isConnected } = useWeb3();

  const [filterType, setFilterType] = useState('all'); // all, purchases, transfers, staking, rewards
  const [searchQuery, setSearchQuery] = useState('');
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [stats, setStats] = useState({
    totalSpent: 0,
    totalEarned: 0,
    totalCashback: 0
  });

  // Cargar transacciones del usuario
  useEffect(() => {
    if (user) {
      loadTransactions();
    } else {
      // Si no está autenticado, mostrar estado vacío
      setLoading(false);
      setActivities([]);
    }
  }, [user, page]);

  const loadTransactions = async () => {
    try {
      setLoading(true);

      // Obtener transacciones del usuario desde la BD
      const response = await api.get(`/transactions/user/${user.id}`, {
        params: {
          page,
          limit: 10
        }
      });

      const dbTransactions = response.data.transactions || [];

      // Convertir transacciones de BD a formato de actividad
      const formattedActivities = dbTransactions.map(tx => {
        // Determinar si es gasto o ingreso según el tipo
        const isExpense = ['PURCHASE', 'TICKET_PURCHASE', 'TRANSFER_OUT', 'STAKING', 'STAKE', 'MINT_TICKET'].includes(tx.type);
        const amount = isExpense ? -parseFloat(tx.amount) : parseFloat(tx.amount);

        return {
          id: tx.id,
          type: mapTransactionType(tx.type),
          title: getTransactionTitle(tx.type),
          description: getTransactionDescription(tx),
          amount: amount,
          token: 'FELICOINS',
          cashback: tx.metadata?.cashback || 0,
          date: new Date(tx.createdAt).toLocaleString('es-ES'),
          status: tx.status.toLowerCase(),
          hash: tx.txHash || '0x...'
        };
      });

      if (page === 1) {
        setActivities(formattedActivities);
      } else {
        setActivities(prev => [...prev, ...formattedActivities]);
      }

      setHasMore(formattedActivities.length === 10);

      // Calcular estadísticas
      calculateStats(dbTransactions);

    } catch (error) {
      console.error('Error cargando transacciones:', error);
      // Si hay error, mostrar estado vacío
      setActivities([]);
      setStats({ totalSpent: 0, totalEarned: 0, totalCashback: 0 });
    } finally {
      setLoading(false);
    }
  };



  // Mapear tipos de transacción de BD a tipos de actividad
  const mapTransactionType = (type) => {
    switch(type) {
      case 'PURCHASE': return 'purchase';
      case 'TICKET_PURCHASE': return 'purchase';
      case 'TRANSFER_IN': return 'transfer-in';
      case 'TRANSFER_OUT': return 'transfer-out';
      case 'STAKING': return 'staking';
      case 'STAKE': return 'staking';
      case 'STAKING_WITHDRAW': return 'staking-withdraw';
      case 'UNSTAKE': return 'staking-withdraw';
      case 'STAKING_REWARD': return 'staking-reward';
      case 'CASHBACK': return 'reward';
      case 'REWARD': return 'reward';
      case 'VOTE': return 'reward';
      case 'MINT_TICKET': return 'purchase';
      default: return 'purchase';
    }
  };

  const getTransactionTitle = (type) => {
    switch(type) {
      case 'PURCHASE': return 'Compra en Marketplace';
      case 'TICKET_PURCHASE': return 'Compra de Ticket NFT';
      case 'TRANSFER_IN': return 'FELICOINS Recibidos';
      case 'TRANSFER_OUT': return 'FELICOINS Enviados';
      case 'STAKING': return 'Depósito en Staking';
      case 'STAKE': return 'Depósito en Staking';
      case 'STAKING_WITHDRAW': return 'Retiro de Staking';
      case 'UNSTAKE': return 'Retiro de Staking';
      case 'STAKING_REWARD': return 'Recompensa de Staking';
      case 'CASHBACK': return 'Cashback Recibido';
      case 'REWARD': return 'Recompensa Recibida';
      case 'VOTE': return 'Voto en Propuesta';
      case 'MINT_TICKET': return 'Ticket NFT Generado';
      default: return 'Transacción';
    }
  };

  const getTransactionDescription = (tx) => {
    if (tx.metadata?.productName) return tx.metadata.productName;
    if (tx.metadata?.description) return tx.metadata.description;
    if (tx.metadata?.eventName) return tx.metadata.eventName;
    if (tx.metadata?.from) return `De ${tx.metadata.from.substring(0, 8)}...`;
    if (tx.metadata?.to) return `A ${tx.metadata.to.substring(0, 8)}...`;
    if (tx.metadata?.action === 'stake') return 'Depósito en staking pool';
    if (tx.metadata?.action === 'withdraw') return 'Retiro de staking pool';
    if (tx.metadata?.action === 'claim') return 'Reclamaste recompensas';
    if (tx.type === 'STAKING' || tx.type === 'STAKE') return 'Depósito en staking';
    if (tx.type === 'STAKING_WITHDRAW' || tx.type === 'UNSTAKE') return 'Retiro de staking';
    if (tx.type === 'STAKING_REWARD') return 'Recompensa de staking';
    if (tx.type === 'CASHBACK') return 'Cashback de compra';
    if (tx.product) return tx.product.name || 'Producto';
    if (tx.event) return tx.event.name || 'Evento';
    return 'Transacción completada';
  };

  const calculateStats = (transactions) => {
    // Gastos: compras, envíos y depósitos en staking
    const spent = transactions
      .filter(tx =>
        tx.type === 'PURCHASE' ||
        tx.type === 'TICKET_PURCHASE' ||
        tx.type === 'TRANSFER_OUT' ||
        tx.type === 'STAKING' ||
        tx.type === 'STAKE' ||
        tx.type === 'MINT_TICKET'
      )
      .reduce((acc, tx) => acc + parseFloat(tx.amount || 0), 0);

    // Ingresos: transferencias recibidas, recompensas y retiros de staking
    const earned = transactions
      .filter(tx =>
        tx.type === 'TRANSFER_IN' ||
        tx.type === 'STAKING_REWARD' ||
        tx.type === 'REWARD' ||
        tx.type === 'STAKING_WITHDRAW' ||
        tx.type === 'UNSTAKE' ||
        tx.type === 'CASHBACK' ||
        tx.type === 'VOTE' // Algunos votes pueden dar recompensas
      )
      .reduce((acc, tx) => acc + parseFloat(tx.amount || 0), 0);

    // Cashback: suma de todo el cashback recibido
    const cashback = transactions
      .filter(tx => tx.type === 'CASHBACK' || tx.metadata?.cashback)
      .reduce((acc, tx) => {
        if (tx.type === 'CASHBACK') {
          return acc + parseFloat(tx.amount || 0);
        }
        return acc + parseFloat(tx.metadata?.cashback || 0);
      }, 0);

    setStats({ totalSpent: spent, totalEarned: earned, totalCashback: cashback });
  };

  // Función para exportar historial
  const handleExport = () => {
    try {
      // Convertir a CSV
      const headers = ['Fecha', 'Tipo', 'Descripción', 'Monto', 'Token', 'Cashback', 'Estado', 'Hash'];
      const csvContent = [
        headers.join(','),
        ...filteredActivities.map(activity => [
          activity.date,
          activity.title,
          activity.description,
          activity.amount,
          activity.token,
          activity.cashback || 0,
          activity.status,
          activity.hash
        ].join(','))
      ].join('\n');

      // Crear blob y descargar
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);

      link.setAttribute('href', url);
      link.setAttribute('download', `historial_felistore_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      alert('✅ Historial exportado exitosamente');
    } catch (error) {
      console.error('Error exportando:', error);
      alert('❌ Error al exportar el historial');
    }
  };

  // Función para cargar más
  const handleLoadMore = () => {
    if (!loading && hasMore) {
      setPage(prev => prev + 1);
    }
  };

  const getActivityIcon = (type) => {
    switch(type) {
      case 'purchase': return { icon: ShoppingBag, color: 'text-purple-400', bg: 'bg-purple-500/10' };
      case 'transfer-in': return { icon: ArrowDownLeft, color: 'text-emerald-400', bg: 'bg-emerald-500/10' };
      case 'transfer-out': return { icon: ArrowUpRight, color: 'text-rose-400', bg: 'bg-rose-500/10' };
      case 'staking': return { icon: Zap, color: 'text-blue-400', bg: 'bg-blue-500/10' };
      case 'staking-withdraw': return { icon: ArrowDownLeft, color: 'text-blue-400', bg: 'bg-blue-500/10' };
      case 'staking-reward': return { icon: Zap, color: 'text-amber-400', bg: 'bg-amber-500/10' };
      case 'cashback': return { icon: Gift, color: 'text-emerald-400', bg: 'bg-emerald-500/10' };
      case 'reward': return { icon: Gift, color: 'text-amber-400', bg: 'bg-amber-500/10' };
      default: return { icon: History, color: 'text-slate-400', bg: 'bg-slate-500/10' };
    }
  };

  const filteredActivities = activities.filter(activity => {
    const matchesFilter = filterType === 'all' ||
      (filterType === 'purchases' && activity.type === 'purchase') ||
      (filterType === 'transfers' && (activity.type === 'transfer-in' || activity.type === 'transfer-out')) ||
      (filterType === 'staking' && (activity.type === 'staking' || activity.type === 'staking-withdraw' || activity.type === 'staking-reward')) ||
      (filterType === 'rewards' && (activity.type === 'reward' || activity.type === 'cashback'));

    const matchesSearch = activity.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         activity.description.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesFilter && matchesSearch;
  });

  const formatNum = (num) => new Intl.NumberFormat('en-US').format(Math.abs(num));


  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white mb-1">Historial de Actividades</h1>
        <p className="text-slate-400">Todas tus transacciones y movimientos</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl">
          <div className="flex items-center gap-2 mb-2">
            <ArrowUpRight className="text-rose-400" size={20} />
            <span className="text-slate-400 text-sm">Total Gastado</span>
          </div>
          <h3 className="text-3xl font-bold text-white">
            {loading ? (
              <Loader className="animate-spin text-slate-600" size={32} />
            ) : (
              <>{formatNum(stats.totalSpent)} <span className="text-lg text-amber-500">FELICOINS</span></>
            )}
          </h3>
        </div>

        <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl">
          <div className="flex items-center gap-2 mb-2">
            <ArrowDownLeft className="text-emerald-400" size={20} />
            <span className="text-slate-400 text-sm">Total Recibido</span>
          </div>
          <h3 className="text-3xl font-bold text-white">
            {loading ? (
              <Loader className="animate-spin text-slate-600" size={32} />
            ) : (
              <>{formatNum(stats.totalEarned)} <span className="text-lg text-amber-500">FELICOINS</span></>
            )}
          </h3>
        </div>

        <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl">
          <div className="flex items-center gap-2 mb-2">
            <Gift className="text-amber-400" size={20} />
            <span className="text-slate-400 text-sm">Cashback Ganado</span>
          </div>
          <h3 className="text-3xl font-bold text-white">
            {loading ? (
              <Loader className="animate-spin text-slate-600" size={32} />
            ) : (
              <>{formatNum(stats.totalCashback)} <span className="text-lg text-amber-500">FELICOINS</span></>
            )}
          </h3>
        </div>
      </div>

      {/* Filtros y Búsqueda */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          {/* Search */}
          <div className="relative flex-1 w-full md:max-w-md">
            <Search className="absolute left-3 top-3 text-slate-500" size={18} />
            <input
              type="text"
              placeholder="Buscar transacciones..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 pl-10 pr-4 text-white placeholder-slate-500 focus:outline-none focus:border-amber-500/50 transition-colors"
            />
          </div>

          {/* Filtros */}
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => setFilterType('all')}
              className={`px-4 py-2 rounded-xl text-sm font-bold transition-colors ${
                filterType === 'all' 
                  ? 'bg-amber-500 text-slate-900' 
                  : 'bg-slate-950 text-slate-400 border border-slate-800 hover:border-slate-600'
              }`}
            >
              Todas
            </button>
            <button
              onClick={() => setFilterType('purchases')}
              className={`px-4 py-2 rounded-xl text-sm font-bold transition-colors ${
                filterType === 'purchases' 
                  ? 'bg-amber-500 text-slate-900' 
                  : 'bg-slate-950 text-slate-400 border border-slate-800 hover:border-slate-600'
              }`}
            >
              Compras
            </button>
            <button
              onClick={() => setFilterType('transfers')}
              className={`px-4 py-2 rounded-xl text-sm font-bold transition-colors ${
                filterType === 'transfers' 
                  ? 'bg-amber-500 text-slate-900' 
                  : 'bg-slate-950 text-slate-400 border border-slate-800 hover:border-slate-600'
              }`}
            >
              Transferencias
            </button>
            <button
              onClick={() => setFilterType('staking')}
              className={`px-4 py-2 rounded-xl text-sm font-bold transition-colors ${
                filterType === 'staking' 
                  ? 'bg-amber-500 text-slate-900' 
                  : 'bg-slate-950 text-slate-400 border border-slate-800 hover:border-slate-600'
              }`}
            >
              Staking
            </button>
            <button
              onClick={() => setFilterType('rewards')}
              className={`px-4 py-2 rounded-xl text-sm font-bold transition-colors ${
                filterType === 'rewards' 
                  ? 'bg-amber-500 text-slate-900' 
                  : 'bg-slate-950 text-slate-400 border border-slate-800 hover:border-slate-600'
              }`}
            >
              Recompensas
            </button>
          </div>

          {/* Export Button */}
          <button
            onClick={handleExport}
            disabled={filteredActivities.length === 0}
            className={`px-4 py-2 bg-slate-950 border border-slate-800 rounded-xl font-medium transition-colors flex items-center gap-2 ${
              filteredActivities.length > 0 
                ? 'text-white hover:border-slate-600' 
                : 'text-slate-600 cursor-not-allowed'
            }`}
          >
            <Download size={18} />
            Exportar CSV
          </button>
        </div>
      </div>

      {/* Lista de Actividades */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
        <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
          <History className="text-amber-500" size={24} />
          Actividades ({filteredActivities.length})
        </h3>

        <div className="space-y-3">
          {loading && page === 1 ? (
            <div className="text-center py-12">
              <Loader className="animate-spin mx-auto text-amber-500 mb-4" size={48} />
              <p className="text-slate-400">Cargando historial...</p>
            </div>
          ) : filteredActivities.length === 0 ? (
            <div className="text-center py-12">
              <History className="mx-auto text-slate-700 mb-4" size={48} />
              <p className="text-slate-400">No se encontraron actividades</p>
              {!user && (
                <p className="text-sm text-slate-500 mt-2">Inicia sesión para ver tu historial real</p>
              )}
            </div>
          ) : (
            filteredActivities.map((activity) => {
              const { icon: Icon, color, bg } = getActivityIcon(activity.type);

              return (
                <div key={activity.id} className="flex items-center justify-between p-4 bg-slate-950/50 rounded-xl hover:bg-slate-950 transition-colors group">
                  <div className="flex items-center gap-4 flex-1">
                    <div className={`w-12 h-12 rounded-xl ${bg} flex items-center justify-center shrink-0`}>
                      <Icon className={color} size={24} />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-bold text-white truncate">{activity.title}</h4>
                        {activity.status === 'completed' && (
                          <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-400 text-xs font-bold rounded">
                            Completado
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-slate-400 truncate">{activity.description}</p>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="text-xs text-slate-500">{activity.date}</span>
                        {activity.cashback && (
                          <span className="text-xs text-emerald-400 font-bold flex items-center gap-1">
                            <Zap size={10} fill="currentColor" />
                            +{activity.cashback} Cashback
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="text-right flex items-center gap-4">
                    <div>
                      <p className={`font-bold text-lg ${
                        activity.amount > 0 ? 'text-emerald-400' : 'text-rose-400'
                      }`}>
                        {activity.amount > 0 ? '+' : ''}{formatNum(activity.amount)} {activity.token}
                      </p>
                      <a
                        href={`https://etherscan.io/tx/${activity.hash}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-slate-500 hover:text-slate-400 transition-colors flex items-center gap-1 justify-end opacity-0 group-hover:opacity-100"
                      >
                        Ver tx <ExternalLink size={10} />
                      </a>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Pagination */}
        {filteredActivities.length > 0 && hasMore && (
          <div className="mt-6 pt-6 border-t border-slate-800 flex justify-center">
            <button
              onClick={handleLoadMore}
              disabled={loading}
              className={`px-6 py-3 bg-slate-950 border border-slate-800 rounded-xl font-medium transition-colors flex items-center gap-2 ${
                loading 
                  ? 'text-slate-600 cursor-not-allowed' 
                  : 'text-white hover:border-slate-600'
              }`}
            >
              {loading ? (
                <>
                  <Loader className="animate-spin" size={18} />
                  Cargando...
                </>
              ) : (
                'Cargar más'
              )}
            </button>
          </div>
        )}

        {filteredActivities.length > 0 && !hasMore && (
          <div className="mt-6 pt-6 border-t border-slate-800 text-center">
            <p className="text-slate-500 text-sm">No hay más transacciones para mostrar</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default HistoryView;

