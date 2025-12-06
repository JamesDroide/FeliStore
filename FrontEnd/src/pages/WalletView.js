import React, { useState } from 'react';
import {
  Wallet,
  ArrowUpRight,
  ArrowDownLeft,
  Copy,
  ExternalLink,
  Eye,
  EyeOff,
  Zap,
  TrendingUp,
  TrendingDown,
  RefreshCw,
  Send,
  Download
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.js';

const WalletView = () => {
  const { user: authUser } = useAuth();
  const [showBalance, setShowBalance] = useState(true);
  const [activeTab, setActiveTab] = useState('overview'); // overview, send, receive

  // Datos de la wallet desde authContext
  const walletData = {
    address: authUser?.walletAddress ? authUser.walletAddress.slice(0, 6) + '...' + authUser.walletAddress.slice(-4) : 'No vinculada',
    fullAddress: authUser?.walletAddress || 'No vinculada',
    feliBalance: 0, // Se obtendrá del contrato
    ethBalance: 0,
    usdBalance: 0,
    stakedAmount: 0,
    availableToWithdraw: 0
  };

  // Transacciones recientes
  const recentTransactions = [
    {
      id: 1,
      type: 'receive',
      amount: 500,
      token: 'Felicoins',
      from: '0x8a3...2b4c',
      date: '2025-12-05 14:30',
      status: 'completed',
      hash: '0xabc...def'
    },
    {
      id: 2,
      type: 'send',
      amount: 250,
      token: 'Felicoins',
      to: '0x9f2...1a8d',
      date: '2025-12-04 10:15',
      status: 'completed',
      hash: '0x123...789'
    },
    {
      id: 3,
      type: 'stake',
      amount: 1000,
      token: 'Felicoins',
      date: '2025-12-03 08:20',
      status: 'completed',
      hash: '0xdef...abc'
    },
    {
      id: 4,
      type: 'receive',
      amount: 2000,
      token: 'Felicoins',
      from: '0x5c7...9d2e',
      date: '2025-12-02 16:45',
      status: 'completed',
      hash: '0x456...123'
    }
  ];

  const copyAddress = () => {
    navigator.clipboard.writeText(walletData.fullAddress);
    alert('Dirección copiada al portapapeles');
  };

  const formatNum = (num) => new Intl.NumberFormat('en-US').format(num);

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white mb-1">Mi Billetera</h1>
          <p className="text-slate-400">Gestiona tus activos y transacciones</p>
        </div>
        <button className="px-4 py-2 bg-slate-900 border border-slate-800 rounded-xl text-white font-medium hover:border-slate-600 transition-colors flex items-center gap-2">
          <RefreshCw size={18} />
          Actualizar
        </button>
      </div>

      {/* Balance Card Principal */}
      <div className="p-8 rounded-3xl bg-gradient-to-br from-slate-900 via-slate-900 to-amber-950 border border-slate-800 relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-amber-500/10 blur-[120px] rounded-full"></div>

        <div className="relative z-10">
          {/* Address Bar */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
                <Wallet className="text-amber-500" size={24} />
              </div>
              <div>
                <p className="text-xs text-slate-500 mb-1">Dirección de Wallet</p>
                <div className="flex items-center gap-2">
                  <span className="text-white font-mono font-medium">{walletData.address}</span>
                  <button onClick={copyAddress} className="text-slate-400 hover:text-white transition-colors">
                    <Copy size={16} />
                  </button>
                  <a href={`https://etherscan.io/address/${walletData.fullAddress}`} target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-white transition-colors">
                    <ExternalLink size={16} />
                  </a>
                </div>
              </div>
            </div>
            <button onClick={() => setShowBalance(!showBalance)} className="p-2 hover:bg-slate-800 rounded-lg transition-colors">
              {showBalance ? <Eye className="text-slate-400" size={20} /> : <EyeOff className="text-slate-400" size={20} />}
            </button>
          </div>

          {/* Balance Principal */}
          <div className="mb-6">
            <p className="text-slate-400 text-sm mb-2">Balance Total</p>
            <div className="flex items-end gap-4 mb-2">
              <h2 className="text-6xl font-bold text-white">
                {showBalance ? formatNum(walletData.feliBalance) : '••••••'}
              </h2>
              <span className="text-3xl font-bold text-amber-500 mb-2">Felicoins</span>
            </div>
            <p className="text-slate-400">≈ ${formatNum(walletData.usdBalance)} USD</p>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-3 gap-4">
            <button
              onClick={() => setActiveTab('send')}
              className="px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-600 text-slate-900 font-bold rounded-xl hover:shadow-lg hover:shadow-amber-500/20 transition-all flex items-center justify-center gap-2"
            >
              <ArrowUpRight size={20} />
              Enviar
            </button>
            <button
              onClick={() => setActiveTab('receive')}
              className="px-6 py-3 bg-slate-800 border border-slate-700 text-white font-medium rounded-xl hover:bg-slate-700 transition-colors flex items-center justify-center gap-2"
            >
              <ArrowDownLeft size={20} />
              Recibir
            </button>
            <button className="px-6 py-3 bg-slate-800 border border-slate-700 text-white font-medium rounded-xl hover:bg-slate-700 transition-colors flex items-center justify-center gap-2">
              <Download size={20} />
              Retirar
            </button>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* ETH Balance */}
        <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl hover:border-slate-700 transition-colors">
          <div className="flex justify-between items-start mb-4">
            <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center">
              <TrendingUp className="text-blue-400" size={24} />
            </div>
            <span className="px-2 py-1 bg-blue-500/10 text-blue-400 text-xs font-bold rounded">ETH</span>
          </div>
          <p className="text-slate-400 text-sm mb-1">Balance Ethereum</p>
          <h3 className="text-2xl font-bold text-white">{walletData.ethBalance} ETH</h3>
          <p className="text-xs text-slate-500 mt-2">≈ ${formatNum(walletData.ethBalance * 2000)} USD</p>
        </div>

        {/* Staked */}
        <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl hover:border-slate-700 transition-colors">
          <div className="flex justify-between items-start mb-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center">
              <Zap className="text-emerald-400" size={24} />
            </div>
            <span className="px-2 py-1 bg-emerald-500/10 text-emerald-400 text-xs font-bold rounded">STAKING</span>
          </div>
          <p className="text-slate-400 text-sm mb-1">Total en Staking</p>
          <h3 className="text-2xl font-bold text-white">{formatNum(walletData.stakedAmount)} Felicoins</h3>
          <p className="text-xs text-emerald-400 mt-2 flex items-center gap-1">
            <TrendingUp size={12} />
            APY 5.4% (+20 Felicoins/día)
          </p>
        </div>

        {/* Available */}
        <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl hover:border-slate-700 transition-colors">
          <div className="flex justify-between items-start mb-4">
            <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center">
              <Wallet className="text-purple-400" size={24} />
            </div>
            <span className="px-2 py-1 bg-purple-500/10 text-purple-400 text-xs font-bold rounded">LIBRE</span>
          </div>
          <p className="text-slate-400 text-sm mb-1">Disponible para Gastar</p>
          <h3 className="text-2xl font-bold text-white">{formatNum(walletData.availableToWithdraw)} Felicoins</h3>
          <p className="text-xs text-slate-500 mt-2">Sin bloqueos ni compromisos</p>
        </div>
      </div>

      {/* Transacciones Recientes */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold text-white">Transacciones Recientes</h3>
          <button className="text-sm text-amber-500 font-bold hover:text-amber-400 transition-colors">
            Ver todas →
          </button>
        </div>

        <div className="space-y-3">
          {recentTransactions.map((tx) => (
            <div key={tx.id} className="flex items-center justify-between p-4 bg-slate-950/50 rounded-xl hover:bg-slate-950 transition-colors">
              <div className="flex items-center gap-4">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  tx.type === 'receive' ? 'bg-emerald-500/10' :
                  tx.type === 'send' ? 'bg-rose-500/10' :
                  'bg-blue-500/10'
                }`}>
                  {tx.type === 'receive' ? <ArrowDownLeft className="text-emerald-400" size={20} /> :
                   tx.type === 'send' ? <ArrowUpRight className="text-rose-400" size={20} /> :
                   <Zap className="text-blue-400" size={20} />}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white">
                      {tx.type === 'receive' ? 'Recibido de' :
                       tx.type === 'send' ? 'Enviado a' :
                       'Staking'}
                    </span>
                    {(tx.from || tx.to) && (
                      <span className="text-slate-400 text-sm font-mono">{tx.from || tx.to}</span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500">{tx.date}</p>
                </div>
              </div>
              <div className="text-right">
                <p className={`font-bold ${
                  tx.type === 'receive' ? 'text-emerald-400' :
                  tx.type === 'send' ? 'text-rose-400' :
                  'text-blue-400'
                }`}>
                  {tx.type === 'receive' ? '+' : '-'}{formatNum(tx.amount)} {tx.token}
                </p>
                <a
                  href={`https://etherscan.io/tx/${tx.hash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-slate-500 hover:text-slate-400 transition-colors flex items-center gap-1 justify-end"
                >
                  Ver en Etherscan <ExternalLink size={10} />
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modal de Enviar (placeholder) */}
      {activeTab === 'send' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={() => setActiveTab('overview')}>
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 max-w-md w-full" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
              <Send className="text-amber-500" />
              Enviar Felicoins
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-slate-400 mb-2">Dirección destino</label>
                <input type="text" placeholder="0x..." className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white" />
              </div>
              <div>
                <label className="block text-sm text-slate-400 mb-2">Cantidad</label>
                <input type="number" placeholder="0.00" className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white" />
              </div>
              <button className="w-full py-3 bg-gradient-to-r from-amber-500 to-orange-600 text-slate-900 font-bold rounded-xl hover:shadow-lg transition-all">
                Enviar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WalletView;

