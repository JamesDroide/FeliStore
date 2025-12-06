import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import {
  Wallet,
  ArrowUpRight,
  ArrowDownLeft,
  Copy,
  Check,
  ExternalLink,
  Eye,
  EyeOff,
  Zap,
  RefreshCw,
  Send,
  Download,
  AlertCircle,
  TrendingUp,
  X
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.js';
import WalletConnect from '../components/WalletConnect.js';
import {useWeb3} from "../context/Web3Context.js";
import api from '../services/api.js';

const WalletView = ({ autoOpenModal = null, onModalOpened = () => {} }) => {
  const { user: authUser } = useAuth();
  const {
    account,
    balance,
    feliBalance,
    isConnected,
    updateBalances,
    getStakingInfo,
    contracts
  } = useWeb3();

  const [showBalance, setShowBalance] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [copied, setCopied] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [stakingInfo, setStakingInfo] = useState(null);

  // Estados para modales
  const [showSendModal, setShowSendModal] = useState(false);
  const [showReceiveModal, setShowReceiveModal] = useState(false);
  const [showStakingModal, setShowStakingModal] = useState(false);

  // Estados para formularios
  const [sendForm, setSendForm] = useState({ to: '', amount: '' });
  const [stakingForm, setStakingForm] = useState({ amount: '', action: 'stake' });
  const [isSending, setIsSending] = useState(false);
  const [isStaking, setIsStaking] = useState(false);

  // Actualizar balances cuando se monta el componente
  useEffect(() => {
    if (isConnected && account) {
      updateBalances();
      loadStakingInfo();
    } else {
      setStakingInfo(null);
    }
  }, [isConnected, account]);

  // Abrir modal automáticamente si se especifica desde el dashboard
  useEffect(() => {
    if (autoOpenModal && isConnected) {
      // Pequeño delay para que la vista se renderice primero
      const timer = setTimeout(() => {
        if (autoOpenModal === 'send') {
          setShowSendModal(true);
        } else if (autoOpenModal === 'receive') {
          setShowReceiveModal(true);
        } else if (autoOpenModal === 'staking') {
          setShowStakingModal(true);
        }
        // Notificar que el modal fue abierto para limpiar el estado en App
        onModalOpened();
      }, 300);

      return () => clearTimeout(timer);
    }
  }, [autoOpenModal, isConnected, onModalOpened]);

  // Cargar información de staking
  const loadStakingInfo = async () => {
    try {
      if (!isConnected || !account) {
        setStakingInfo(null);
        return;
      }

      const info = await getStakingInfo();
      setStakingInfo(info);
    } catch (error) {
      console.error('Error cargando staking info:', error);
      // Establecer valores por defecto en caso de error
      setStakingInfo({
        amount: '0',
        stakedAt: null,
        lastClaimAt: null,
        pendingRewards: '0'
      });
    }
  };

  // Copiar dirección
  const copyAddress = () => {
    if (account) {
      navigator.clipboard.writeText(account);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // Refrescar balances
  const handleRefresh = async () => {
    setIsRefreshing(true);
    await updateBalances();
    await loadStakingInfo();
    setTimeout(() => setIsRefreshing(false), 1000);
  };

  // Formatear dirección
  const formatAddress = (addr) => {
    if (!addr) return 'No conectada';
    return `${addr.substring(0, 6)}...${addr.substring(addr.length - 4)}`;
  };

  // Manejar envío de FELICOINS
  const handleSendTokens = async (e) => {
    e.preventDefault();
    if (!sendForm.to || !sendForm.amount) {
      alert('Por favor completa todos los campos');
      return;
    }

    if (parseFloat(sendForm.amount) <= 0) {
      alert('El monto debe ser mayor a 0');
      return;
    }

    if (parseFloat(sendForm.amount) > parseFloat(feliBalance)) {
      alert('Saldo insuficiente');
      return;
    }

    if (!contracts?.felicoin) {
      alert('Contrato no inicializado. Por favor reconecta tu wallet.');
      return;
    }

    setIsSending(true);
    try {
      const amount = ethers.parseEther(sendForm.amount);

      console.log('💸 Enviando', sendForm.amount, 'FELICOINS a', sendForm.to);

      // Realizar transferencia real en blockchain
      const tx = await contracts.felicoin.transfer(sendForm.to, amount);
      console.log('📝 Transacción enviada:', tx.hash);

      // Esperar confirmación
      await tx.wait();
      console.log('✅ Transacción confirmada');

      alert(`✅ Enviaste ${sendForm.amount} FELICOINS a ${formatAddress(sendForm.to)}`);
      setSendForm({ to: '', amount: '' });
      setShowSendModal(false);
      await updateBalances();
    } catch (error) {
      console.error('Error enviando tokens:', error);
      if (error.code === 'ACTION_REJECTED') {
        alert('❌ Transacción rechazada por el usuario');
      } else {
        alert('❌ Error al enviar tokens: ' + (error.message || 'Error desconocido'));
      }
    } finally {
      setIsSending(false);
    }
  };

  // Manejar staking
  const handleStaking = async (e) => {
    e.preventDefault();
    if (!stakingForm.amount) {
      alert('Por favor ingresa un monto');
      return;
    }

    if (parseFloat(stakingForm.amount) <= 0) {
      alert('El monto debe ser mayor a 0');
      return;
    }

    if (stakingForm.action === 'stake' && parseFloat(stakingForm.amount) > parseFloat(feliBalance)) {
      alert('Saldo insuficiente');
      return;
    }

    if (!contracts?.felicoin || !contracts?.staking) {
      alert('Contratos no inicializados. Por favor reconecta tu wallet.');
      return;
    }

    setIsStaking(true);
    try {
      const amount = ethers.parseEther(stakingForm.amount);
      let txReceipt;

      if (stakingForm.action === 'stake') {
        console.log('🔒 Haciendo staking de', stakingForm.amount, 'FELICOINS');

        // 1. Aprobar tokens
        console.log('1️⃣ Aprobando tokens...');
        const approveTx = await contracts.felicoin.approve(
          await contracts.staking.getAddress(),
          amount
        );
        await approveTx.wait();
        console.log('✅ Tokens aprobados');

        // 2. Stake
        console.log('2️⃣ Haciendo stake...');
        const stakeTx = await contracts.staking.stake(amount);
        txReceipt = await stakeTx.wait();
        console.log('✅ Stake completado');

        // 3. Guardar transacción en BD
        if (authUser?.id && txReceipt) {
          try {
            console.log('💾 Guardando transacción de staking en BD...');
            await api.post('/transactions', {
              txHash: txReceipt.hash,
              type: 'STAKING',
              userId: authUser.id,
              amount: stakingForm.amount,
              status: 'CONFIRMED',
              metadata: {
                action: 'stake',
                apy: '5.4%',
                timestamp: new Date().toISOString()
              }
            });
            console.log('✅ Transacción de staking guardada');
          } catch (dbError) {
            console.warn('⚠️ Error guardando transacción de staking:', dbError);
          }
        }

        alert(`✅ Has hecho staking de ${stakingForm.amount} FELICOINS. Ganarás 5.4% APY.`);
      } else {
        console.log('🔓 Retirando', stakingForm.amount, 'FELICOINS del staking');

        const withdrawTx = await contracts.staking.withdraw(amount);
        txReceipt = await withdrawTx.wait();
        console.log('✅ Retiro completado');

        // Guardar transacción de retiro en BD
        if (authUser?.id && txReceipt) {
          try {
            console.log('💾 Guardando transacción de retiro en BD...');
            await api.post('/transactions', {
              txHash: txReceipt.hash,
              type: 'STAKING_WITHDRAW',
              userId: authUser.id,
              amount: stakingForm.amount,
              status: 'CONFIRMED',
              metadata: {
                action: 'withdraw',
                timestamp: new Date().toISOString()
              }
            });
            console.log('✅ Transacción de retiro guardada');
          } catch (dbError) {
            console.warn('⚠️ Error guardando transacción de retiro:', dbError);
          }
        }

        alert(`✅ Has retirado ${stakingForm.amount} FELICOINS del staking.`);
      }

      setStakingForm({ amount: '', action: 'stake' });
      setShowStakingModal(false);
      await updateBalances();
      await loadStakingInfo();
    } catch (error) {
      console.error('Error en staking:', error);
      if (error.code === 'ACTION_REJECTED') {
        alert('❌ Transacción rechazada por el usuario');
      } else {
        alert('❌ Error en la operación de staking: ' + (error.message || 'Error desconocido'));
      }
    } finally {
      setIsStaking(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Wallet className="text-amber-500" size={32} />
            Mi Billetera Web3
          </h1>
          <p className="text-slate-400 mt-1">Gestiona tus FELICOINS y conecta con MetaMask</p>
        </div>
        {isConnected && (
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="flex items-center gap-2 px-4 py-2 bg-slate-900 border border-slate-800 rounded-xl hover:border-slate-600 transition-colors text-sm font-medium disabled:opacity-50"
          >
            <RefreshCw size={16} className={isRefreshing ? 'animate-spin' : ''} />
            Actualizar
          </button>
        )}
      </div>

      {/* Wallet Connection Card */}
      {!isConnected ? (
        <div className="p-12 rounded-3xl bg-gradient-to-br from-slate-900 via-slate-900 to-purple-950 border border-slate-800 text-center">
          <div className="max-w-md mx-auto">
            <div className="w-20 h-20 bg-purple-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <Wallet size={40} className="text-purple-400" />
            </div>
            <h2 className="text-2xl font-bold mb-3">Conecta tu Billetera MetaMask</h2>
            <p className="text-slate-400 mb-8">
              Para usar FELICOINS y realizar transacciones en la blockchain, necesitas conectar tu wallet de MetaMask.
            </p>
            <WalletConnect />

            <div className="mt-8 pt-8 border-t border-slate-800">
              <p className="text-sm text-slate-500 mb-3">¿No tienes MetaMask?</p>
              <a
                href="https://metamask.io/download/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-purple-400 hover:text-purple-300 text-sm font-medium"
              >
                Descargar MetaMask <ExternalLink size={14} />
              </a>
            </div>
          </div>
        </div>
      ) : (
        <>
          {/* Main Balance Cards Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* FELI Balance - Destacado */}
            <div className="lg:col-span-2 p-8 rounded-3xl bg-gradient-to-br from-slate-900 via-slate-900 to-amber-950 border border-slate-800 relative overflow-hidden group">
              <div className="absolute right-0 top-0 w-96 h-96 bg-amber-500/10 blur-[120px] rounded-full group-hover:bg-amber-500/20 transition-all duration-700"></div>

              <div className="relative z-10">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-amber-500/10 rounded-xl flex items-center justify-center">
                      <img src="/Felicoin.png" alt="Felicoins" className="w-8 h-8 object-contain" />
                    </div>
                    <div>
                      <p className="text-sm text-slate-400">Balance Principal</p>
                      <p className="text-lg font-bold text-white">FELICOINS</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowBalance(!showBalance)}
                    className="p-2 hover:bg-slate-800/50 rounded-lg transition-colors"
                  >
                    {showBalance ? <Eye size={20} className="text-slate-400" /> : <EyeOff size={20} className="text-slate-400" />}
                  </button>
                </div>

                <div className="mb-6">
                  <h2 className="text-5xl font-bold text-white mb-2">
                    {showBalance ? parseFloat(feliBalance).toFixed(2) : '••••••'}
                  </h2>
                  <p className="text-slate-400 text-sm">FELICOINS</p>
                  <p className="text-slate-500 text-xs mt-1">≈ ${showBalance ? (parseFloat(feliBalance) * 0.05).toFixed(2) : '•••'} USD</p>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => setShowSendModal(true)}
                    className="flex-1 py-3 bg-amber-500 hover:bg-amber-400 text-slate-900 font-bold rounded-xl transition-colors flex items-center justify-center gap-2"
                  >
                    <Send size={18} />
                    Enviar
                  </button>
                  <button
                    onClick={() => setShowReceiveModal(true)}
                    className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 text-white font-medium rounded-xl transition-colors flex items-center justify-center gap-2"
                  >
                    <Download size={18} />
                    Recibir
                  </button>
                </div>
              </div>
            </div>

            {/* ETH Balance */}
            <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-10 h-10 bg-indigo-500/10 rounded-lg flex items-center justify-center">
                    <Wallet size={20} className="text-indigo-400" />
                  </div>
                  <div>
                    <p className="text-sm text-slate-400">Gas ETH</p>
                    <p className="text-xs text-slate-500">Para transacciones</p>
                  </div>
                </div>
                <h3 className="text-3xl font-bold text-white mb-1">
                  {showBalance ? parseFloat(balance).toFixed(4) : '••••'}
                </h3>
                <p className="text-sm text-slate-400">ETH</p>
              </div>

              {parseFloat(balance) < 0.001 && (
                <div className="mt-4 p-3 bg-orange-500/10 border border-orange-500/20 rounded-lg flex items-start gap-2">
                  <AlertCircle size={16} className="text-orange-400 mt-0.5" />
                  <p className="text-xs text-orange-400">
                    Balance bajo. Necesitas ETH para pagar gas de transacciones.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Wallet Address Card */}
          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-sm text-slate-400 mb-2">Dirección de tu Wallet</p>
                <code className="text-lg font-mono text-white">{formatAddress(account)}</code>
                <p className="text-xs text-slate-500 mt-1">Red: Hardhat Local (Chain ID: 1337)</p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={copyAddress}
                  className="p-3 bg-slate-800 hover:bg-slate-700 rounded-xl transition-colors"
                  title="Copiar dirección"
                >
                  {copied ? <Check size={20} className="text-green-400" /> : <Copy size={20} className="text-slate-400" />}
                </button>
                <a
                  href={`https://etherscan.io/address/${account}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-3 bg-slate-800 hover:bg-slate-700 rounded-xl transition-colors"
                  title="Ver en explorador"
                >
                  <ExternalLink size={20} className="text-slate-400" />
                </a>
              </div>
            </div>
          </div>

          {/* Staking Info */}
          {stakingInfo && parseFloat(stakingInfo.amount) > 0 && (
            <div className="p-6 rounded-2xl bg-gradient-to-br from-emerald-500/10 to-green-500/10 border border-emerald-500/20">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-emerald-500/20 rounded-lg flex items-center justify-center">
                    <TrendingUp size={20} className="text-emerald-400" />
                  </div>
                  <div>
                    <p className="text-sm text-slate-400">Staking Activo</p>
                    <p className="text-lg font-bold text-white">{parseFloat(stakingInfo.amount).toFixed(2)} FELICOINS</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm text-slate-400">Recompensas Pendientes</p>
                  <p className="text-lg font-bold text-emerald-400">+{parseFloat(stakingInfo.pendingRewards).toFixed(4)} FELICOINS</p>
                </div>
              </div>
              <div className="flex gap-3">
                <button className="flex-1 py-2 bg-emerald-500 hover:bg-emerald-400 text-white font-medium rounded-lg transition-colors text-sm">
                  Reclamar Recompensas
                </button>
                <button className="flex-1 py-2 bg-slate-800 hover:bg-slate-700 text-white font-medium rounded-lg transition-colors text-sm">
                  Retirar Staking
                </button>
              </div>
            </div>
          )}

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button
              onClick={() => setShowSendModal(true)}
              className="p-6 rounded-2xl bg-slate-900 border border-slate-800 hover:border-amber-500/30 transition-all group"
            >
              <div className="w-12 h-12 bg-amber-500/10 rounded-xl flex items-center justify-center mb-3 group-hover:bg-amber-500/20 transition-colors">
                <ArrowUpRight size={24} className="text-amber-500" />
              </div>
              <h3 className="font-bold text-white mb-1">Enviar FELICOINS</h3>
              <p className="text-sm text-slate-400">Transferir a otra wallet</p>
            </button>

            <button
              onClick={() => setShowReceiveModal(true)}
              className="p-6 rounded-2xl bg-slate-900 border border-slate-800 hover:border-blue-500/30 transition-all group"
            >
              <div className="w-12 h-12 bg-blue-500/10 rounded-xl flex items-center justify-center mb-3 group-hover:bg-blue-500/20 transition-colors">
                <ArrowDownLeft size={24} className="text-blue-500" />
              </div>
              <h3 className="font-bold text-white mb-1">Recibir FELICOINS</h3>
              <p className="text-sm text-slate-400">Ver tu dirección y QR</p>
            </button>

            <button
              onClick={() => setShowStakingModal(true)}
              className="p-6 rounded-2xl bg-slate-900 border border-slate-800 hover:border-emerald-500/30 transition-all group"
            >
              <div className="w-12 h-12 bg-emerald-500/10 rounded-xl flex items-center justify-center mb-3 group-hover:bg-emerald-500/20 transition-colors">
                <Zap size={24} className="text-emerald-500" />
              </div>
              <h3 className="font-bold text-white mb-1">Hacer Staking</h3>
              <p className="text-sm text-slate-400">Gana 5.4% APY</p>
            </button>
          </div>

          {/* Info Banner */}
          <div className="p-6 rounded-2xl bg-gradient-to-r from-purple-500/10 to-blue-500/10 border border-purple-500/20">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                <Zap size={20} className="text-purple-400" />
              </div>
              <div>
                <h3 className="font-bold text-white mb-1">¿Sabías que...?</h3>
                <p className="text-sm text-slate-300">
                  Cada compra con FELICOINS te da <span className="text-amber-400 font-bold">cashback automático</span>.
                  Además, puedes hacer staking para ganar un <span className="text-emerald-400 font-bold">5.4% APY</span> en recompensas.
                </p>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Modal Enviar */}
      {showSendModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-slate-900 rounded-2xl border border-slate-800 max-w-md w-full p-6 animate-in slide-in-from-bottom-4 duration-300">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold flex items-center gap-2">
                <Send className="text-amber-500" size={24} />
                Enviar FELICOINS
              </h2>
              <button
                onClick={() => setShowSendModal(false)}
                className="p-2 hover:bg-slate-800 rounded-lg transition-colors"
              >
                <X size={20} className="text-slate-400" />
              </button>
            </div>

            <form onSubmit={handleSendTokens} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-2">
                  Dirección destino
                </label>
                <input
                  type="text"
                  value={sendForm.to}
                  onChange={(e) => setSendForm({ ...sendForm, to: e.target.value })}
                  placeholder="0x..."
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 transition-colors"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-400 mb-2">
                  Cantidad
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.01"
                    value={sendForm.amount}
                    onChange={(e) => setSendForm({ ...sendForm, amount: e.target.value })}
                    placeholder="0.00"
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 pr-24 text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 transition-colors"
                    required
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-amber-500 font-medium text-sm">
                    FELICOINS
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  Disponible: {parseFloat(feliBalance).toFixed(2)} FELICOINS
                </p>
                <button
                  type="button"
                  onClick={() => setSendForm({ ...sendForm, amount: feliBalance })}
                  className="text-xs text-amber-500 hover:text-amber-400 font-medium mt-1"
                >
                  Usar máximo
                </button>
              </div>

              <div className="bg-slate-800/50 rounded-lg p-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Monto</span>
                  <span className="text-white font-medium">{sendForm.amount || '0'} FELICOINS</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Fee estimado</span>
                  <span className="text-white font-medium">~0.001 ETH</span>
                </div>
                <div className="flex justify-between text-sm pt-2 border-t border-slate-700">
                  <span className="text-slate-400 font-medium">Total</span>
                  <span className="text-amber-500 font-bold">{sendForm.amount || '0'} FELICOINS</span>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowSendModal(false)}
                  className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 text-white font-medium rounded-lg transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSending}
                  className="flex-1 py-3 bg-amber-500 hover:bg-amber-400 text-slate-900 font-bold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isSending ? (
                    <>
                      <RefreshCw size={18} className="animate-spin" />
                      Enviando...
                    </>
                  ) : (
                    <>
                      <Send size={18} />
                      Enviar
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Recibir */}
      {showReceiveModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-slate-900 rounded-2xl border border-slate-800 max-w-md w-full p-6 animate-in slide-in-from-bottom-4 duration-300">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold flex items-center gap-2">
                <Download className="text-blue-500" size={24} />
                Recibir FELICOINS
              </h2>
              <button
                onClick={() => setShowReceiveModal(false)}
                className="p-2 hover:bg-slate-800 rounded-lg transition-colors"
              >
                <X size={20} className="text-slate-400" />
              </button>
            </div>

            <div className="space-y-6">
              {/* QR Code Placeholder */}
              <div className="bg-white rounded-xl p-8 flex items-center justify-center">
                <div className="w-48 h-48 bg-slate-200 rounded-lg flex items-center justify-center">
                  <p className="text-slate-600 text-sm text-center">
                    QR Code<br/>de tu dirección
                  </p>
                </div>
              </div>

              {/* Dirección */}
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-2">
                  Tu dirección de wallet
                </label>
                <div className="bg-slate-800 border border-slate-700 rounded-lg p-4">
                  <code className="text-white text-sm break-all">{account}</code>
                </div>
                <button
                  onClick={copyAddress}
                  className="w-full mt-3 py-2 bg-slate-800 hover:bg-slate-700 text-white font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  {copied ? (
                    <>
                      <Check size={18} className="text-green-400" />
                      ¡Copiado!
                    </>
                  ) : (
                    <>
                      <Copy size={18} />
                      Copiar dirección
                    </>
                  )}
                </button>
              </div>

              {/* Información */}
              <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
                <div className="flex gap-3">
                  <AlertCircle size={20} className="text-blue-400 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-blue-300">
                    <p className="font-medium mb-1">Importante:</p>
                    <ul className="list-disc list-inside space-y-1 text-xs">
                      <li>Solo envía FELICOINS a esta dirección</li>
                      <li>Verifica que estés en la red correcta</li>
                      <li>Las transacciones son irreversibles</li>
                    </ul>
                  </div>
                </div>
              </div>

              <button
                onClick={() => setShowReceiveModal(false)}
                className="w-full py-3 bg-blue-500 hover:bg-blue-400 text-white font-bold rounded-lg transition-colors"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Staking */}
      {showStakingModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-slate-900 rounded-2xl border border-slate-800 max-w-md w-full p-6 animate-in slide-in-from-bottom-4 duration-300">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold flex items-center gap-2">
                <Zap className="text-emerald-500" size={24} />
                Staking de FELICOINS
              </h2>
              <button
                onClick={() => setShowStakingModal(false)}
                className="p-2 hover:bg-slate-800 rounded-lg transition-colors"
              >
                <X size={20} className="text-slate-400" />
              </button>
            </div>

            <form onSubmit={handleStaking} className="space-y-4">
              {/* Selector de acción */}
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setStakingForm({ ...stakingForm, action: 'stake' })}
                  className={`py-3 rounded-lg font-medium transition-all ${
                    stakingForm.action === 'stake'
                      ? 'bg-emerald-500 text-white'
                      : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                  }`}
                >
                  Hacer Staking
                </button>
                <button
                  type="button"
                  onClick={() => setStakingForm({ ...stakingForm, action: 'unstake' })}
                  className={`py-3 rounded-lg font-medium transition-all ${
                    stakingForm.action === 'unstake'
                      ? 'bg-orange-500 text-white'
                      : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                  }`}
                >
                  Retirar
                </button>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-400 mb-2">
                  Cantidad
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.01"
                    value={stakingForm.amount}
                    onChange={(e) => setStakingForm({ ...stakingForm, amount: e.target.value })}
                    placeholder="0.00"
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 pr-24 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-colors"
                    required
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-emerald-500 font-medium text-sm">
                    FELICOINS
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  {stakingForm.action === 'stake'
                    ? `Disponible: ${parseFloat(feliBalance).toFixed(2)} FELICOINS`
                    : `En staking: ${stakingInfo ? parseFloat(stakingInfo.amount).toFixed(2) : '0.00'} FELICOINS`}
                </p>
                <button
                  type="button"
                  onClick={() =>
                    setStakingForm({
                      ...stakingForm,
                      amount: stakingForm.action === 'stake' ? feliBalance : stakingInfo?.amount || '0',
                    })
                  }
                  className="text-xs text-emerald-500 hover:text-emerald-400 font-medium mt-1"
                >
                  Usar máximo
                </button>
              </div>

              {/* Info de staking */}
              <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-4 space-y-2">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp size={16} className="text-emerald-400" />
                  <span className="text-sm font-bold text-emerald-400">Beneficios del Staking</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">APY</span>
                  <span className="text-emerald-400 font-bold">5.4%</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Ganancia estimada (anual)</span>
                  <span className="text-white font-medium">
                    +{(parseFloat(stakingForm.amount || 0) * 0.054).toFixed(2)} FELICOINS
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Ganancia diaria</span>
                  <span className="text-white font-medium">
                    +{((parseFloat(stakingForm.amount || 0) * 0.054) / 365).toFixed(4)} FELICOINS
                  </span>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowStakingModal(false)}
                  className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 text-white font-medium rounded-lg transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isStaking}
                  className={`flex-1 py-3 ${
                    stakingForm.action === 'stake'
                      ? 'bg-emerald-500 hover:bg-emerald-400'
                      : 'bg-orange-500 hover:bg-orange-400'
                  } text-white font-bold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2`}
                >
                  {isStaking ? (
                    <>
                      <RefreshCw size={18} className="animate-spin" />
                      Procesando...
                    </>
                  ) : (
                    <>
                      <Zap size={18} />
                      {stakingForm.action === 'stake' ? 'Hacer Staking' : 'Retirar'}
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default WalletView;

