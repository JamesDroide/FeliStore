import React, { useState } from 'react';
import { Wallet, LogOut, Copy, Check, AlertCircle } from 'lucide-react';
import {useWeb3} from "../context/Web3Context.js";

const WalletConnect = () => {
  const {
    account,
    balance,
    feliBalance,
    isConnected,
    isConnecting,
    error,
    connectWallet,
    disconnectWallet,
    isMetaMaskInstalled
  } = useWeb3();

  const [copied, setCopied] = useState(false);

  // Copiar dirección al portapapeles
  const copyAddress = () => {
    if (account) {
      navigator.clipboard.writeText(account);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // Formatear dirección (0x1234...5678)
  const formatAddress = (address) => {
    if (!address) return '';
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  };

  // Si MetaMask no está instalado
  if (!isMetaMaskInstalled) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3">
        <AlertCircle className="text-red-500" size={20} />
        <div className="flex-1">
          <p className="text-red-700 font-medium">MetaMask no detectado</p>
          <p className="text-red-600 text-sm">Por favor instala MetaMask para continuar</p>
        </div>
        <a
          href="https://metamask.io/download/"
          target="_blank"
          rel="noopener noreferrer"
          className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors text-sm font-medium"
        >
          Instalar MetaMask
        </a>
      </div>
    );
  }

  // Si hay un error
  if (error && !isConnected) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="flex items-center gap-2 mb-2">
          <AlertCircle className="text-red-500" size={20} />
          <p className="text-red-700 font-medium">Error de Conexión</p>
        </div>
        <p className="text-red-600 text-sm mb-3">{error}</p>
        <button
          onClick={connectWallet}
          disabled={isConnecting}
          className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors text-sm font-medium w-full"
        >
          Reintentar
        </button>
      </div>
    );
  }

  // Si no está conectado
  if (!isConnected) {
    return (
      <button
        onClick={connectWallet}
        disabled={isConnecting}
        className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-3 rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all duration-200 font-medium flex items-center gap-2 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <Wallet size={20} />
        {isConnecting ? 'Conectando...' : 'Conectar MetaMask'}
      </button>
    );
  }

  // Si está conectado - Versión completa (para usar en páginas)
  return (
    <div className="bg-gradient-to-br from-purple-50 to-blue-50 border border-purple-200 rounded-xl p-6 shadow-lg">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-2 rounded-lg">
            <Wallet className="text-white" size={20} />
          </div>
          <div>
            <p className="text-sm text-gray-600">Wallet Conectada</p>
            <p className="font-semibold text-gray-800">MetaMask</p>
          </div>
        </div>
        <button
          onClick={disconnectWallet}
          className="text-red-500 hover:text-red-600 p-2 hover:bg-red-50 rounded-lg transition-colors"
          title="Desconectar"
        >
          <LogOut size={20} />
        </button>
      </div>

      {/* Dirección */}
      <div className="bg-white rounded-lg p-3 mb-4">
        <p className="text-xs text-gray-600 mb-1">Dirección</p>
        <div className="flex items-center justify-between">
          <code className="text-sm font-mono text-gray-800">{formatAddress(account)}</code>
          <button
            onClick={copyAddress}
            className="text-purple-600 hover:text-purple-700 p-1 hover:bg-purple-50 rounded transition-colors"
            title="Copiar dirección"
          >
            {copied ? <Check size={16} /> : <Copy size={16} />}
          </button>
        </div>
      </div>

      {/* Balances */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-white rounded-lg p-3">
          <p className="text-xs text-gray-600 mb-1">Balance ETH</p>
          <p className="text-lg font-bold text-gray-800">{parseFloat(balance).toFixed(4)}</p>
          <p className="text-xs text-gray-500">ETH</p>
        </div>
        <div className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-lg p-3 border border-yellow-200">
          <p className="text-xs text-gray-600 mb-1">Balance FELI</p>
          <p className="text-lg font-bold text-orange-600">{parseFloat(feliBalance).toFixed(2)}</p>
          <p className="text-xs text-orange-500">FELI</p>
        </div>
      </div>
    </div>
  );
};

// Versión compacta para navbar
export const WalletButton = () => {
  const {
    account,
    feliBalance,
    isConnected,
    isConnecting,
    connectWallet,
    disconnectWallet
  } = useWeb3();

  const [showMenu, setShowMenu] = useState(false);

  const formatAddress = (address) => {
    if (!address) return '';
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  };

  if (!isConnected) {
    return (
      <button
        onClick={connectWallet}
        disabled={isConnecting}
        className="group px-4 py-2 rounded-xl bg-gradient-to-r from-purple-500/10 to-blue-500/10 border border-purple-500/20 hover:border-purple-500/40 text-white font-medium flex items-center gap-2 text-sm transition-all disabled:opacity-50"
      >
        <div className="p-1 rounded-lg bg-gradient-to-br from-purple-500 to-blue-500">
          <Wallet size={14} className="text-white" />
        </div>
        {isConnecting ? 'Conectando...' : 'Conectar Wallet'}
      </button>
    );
  }

  return (
    <div className="relative">
      <button
        onClick={() => setShowMenu(!showMenu)}
        className="group flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-br from-purple-500/10 to-blue-500/10 border border-purple-500/20 hover:border-purple-500/40 transition-all"
      >
        <div className="p-1 rounded-lg bg-gradient-to-br from-purple-500 to-blue-500 shadow-lg shadow-purple-500/20">
          <Wallet size={14} className="text-white" />
        </div>
        <span className="hidden md:inline text-sm font-medium text-slate-300">{formatAddress(account)}</span>
        <div className="px-2 py-0.5 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 shadow-lg shadow-amber-500/20">
                        <span className="text-xs font-bold text-slate-900">
            {parseFloat(feliBalance).toFixed(0)} FELICOINS
          </span>
        </div>
      </button>

      {/* Dropdown Menu */}
      {showMenu && (
        <div className="absolute right-0 mt-2 w-72 bg-slate-900 rounded-xl shadow-2xl border border-slate-800 z-[9999] overflow-hidden">
          <div className="p-4">
            <div className="flex items-center gap-2 mb-3">
              <div className="p-2 rounded-lg bg-gradient-to-br from-purple-500 to-blue-500">
                <Wallet size={16} className="text-white" />
              </div>
              <div>
                <p className="text-xs text-slate-400">Tu Wallet</p>
                <code className="text-xs font-mono text-white">{formatAddress(account)}</code>
              </div>
            </div>

            <div className="bg-gradient-to-br from-amber-500/10 to-orange-500/10 rounded-xl p-4 border border-amber-500/20 mb-3">
              <p className="text-xs text-slate-400 mb-1">Balance FELICOINS</p>
              <p className="text-2xl font-bold text-amber-500">{parseFloat(feliBalance).toFixed(2)}</p>
              <p className="text-xs text-slate-500 mt-1">≈ ${(parseFloat(feliBalance) * 0.1).toFixed(2)} USD</p>
            </div>

            <button
              onClick={() => {
                disconnectWallet();
                setShowMenu(false);
              }}
              className="w-full bg-rose-500/10 border border-rose-500/20 text-rose-400 px-4 py-2 rounded-xl hover:bg-rose-500/20 hover:border-rose-500/40 transition-all flex items-center justify-center gap-2 text-sm font-medium"
            >
              <LogOut size={16} />
              Desconectar
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default WalletConnect;

