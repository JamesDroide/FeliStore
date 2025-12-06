import React, { useState, useEffect } from 'react';
import {
  Star,
  Zap,
  TrendingUp,
  Gift,
  Award,
  Ticket,
  Calendar,
  Clock,
  ChevronRight,
  Lock,
  Unlock,
  CheckCircle,
  Trophy,
  Coins,
  Percent,
  ArrowUpRight,
  ArrowDownRight,
  Info,
  X,
  Image,
  MapPin
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.js';
import { useWeb3 } from "../context/Web3Context.js";
import * as api from '../services/api.js';

const RewardsView = () => {
  const { user } = useAuth();
  const { feliBalance, isConnected, contracts, getStakingInfo } = useWeb3();

  const [activeTab, setActiveTab] = useState('overview'); // overview, staking, coupons, nfts, mycoupons, mynfts
  const [stakingInfo, setStakingInfo] = useState(null);
  const [showStakingModal, setShowStakingModal] = useState(false);
  const [stakingAmount, setStakingAmount] = useState('');
  const [stakingAction, setStakingAction] = useState('stake'); // stake or unstake

  // Estados para cupones y eventos desde el backend
  const [availableCoupons, setAvailableCoupons] = useState([]);
  const [userCoupons, setUserCoupons] = useState([]);
  const [nftEvents, setNftEvents] = useState([]);
  const [userNFTs, setUserNFTs] = useState([]);
  const [userMembership, setUserMembership] = useState(null);
  const [loading, setLoading] = useState(true);

  // Cargar info de staking
  useEffect(() => {
    const loadStakingData = async () => {
      if (isConnected && getStakingInfo) {
        const info = await getStakingInfo();
        setStakingInfo(info);
      }
    };
    loadStakingData();
  }, [isConnected, getStakingInfo]);

  // Cargar cupones, eventos y membresía del backend
  useEffect(() => {
    const loadBackendData = async () => {
      setLoading(true);
      try {
        // Cargar cupones disponibles (no requiere autenticación)
        console.log('📋 Cargando cupones disponibles...');
        const couponsData = await api.getAvailableCoupons();
        console.log('✅ Cupones recibidos:', couponsData);
        setAvailableCoupons(couponsData);

        // Cargar eventos NFT (no requiere autenticación)
        console.log('🎫 Cargando eventos NFT...');
        const eventsData = await api.getAvailableEvents();
        console.log('✅ Eventos recibidos:', eventsData);
        setNftEvents(eventsData);

        // Solo cargar datos de usuario si está autenticado
        if (user) {
          console.log('👤 Usuario autenticado, cargando datos personales...');

          // Cargar cupones del usuario
          const userCouponsData = await api.getUserCoupons(user.id);
          setUserCoupons(userCouponsData);

          // Cargar NFTs del usuario
          const userNFTsData = await api.getUserTickets(user.id);
          setUserNFTs(userNFTsData);

          // Cargar membresía del usuario
          const membershipData = await api.getUserMembership(user.id);
          setUserMembership(membershipData);

          console.log('✅ Datos cargados:', {
            coupons: couponsData.length,
            userCoupons: userCouponsData.length,
            events: eventsData.length,
            userNFTs: userNFTsData.length,
            membership: membershipData
          });
        } else {
          console.log('⚠️ Usuario no autenticado, mostrando solo cupones y eventos públicos');
          console.log('✅ Datos públicos cargados:', {
            coupons: couponsData.length,
            events: eventsData.length
          });
        }
      } catch (error) {
        console.error('❌ Error cargando datos:', error);
        console.error('Error details:', error.response?.data || error.message);
      } finally {
        setLoading(false);
      }
    };

    loadBackendData();
  }, [user]);

  // Recargar info de staking
  const reloadStakingInfo = async () => {
    if (isConnected && getStakingInfo) {
      const info = await getStakingInfo();
      setStakingInfo(info);
    }
  };

  // Canjear cupón con FELICOINS
  const handleRedeemCoupon = async (coupon) => {
    if (!user) {
      alert('⚠️ Por favor inicia sesión');
      return;
    }

    if (!isConnected) {
      alert('⚠️ Por favor conecta tu wallet para pagar con FELICOINS');
      return;
    }

    if (parseFloat(feliBalance) < coupon.cost) {
      alert(`⚠️ Saldo insuficiente. Necesitas ${coupon.cost} FELICOINS`);
      return;
    }

    try {
      const { ethers } = await import('ethers');
      const amount = ethers.parseEther(coupon.cost.toString());

      console.log(`💳 Canjeando cupón: ${coupon.title}`);
      console.log(`💰 Costo: ${coupon.cost} FELICOINS`);

      // 1. Transferir FELICOINS al contrato (quema de tokens por el cupón)
      const paymentAddress = await contracts.loyalty.getAddress();
      const transferTx = await contracts.felicoin.transfer(paymentAddress, amount);
      const receipt = await transferTx.wait();
      const txHash = receipt.hash;

      console.log('✅ Pago realizado, TX:', txHash);

      // 2. Canjear en el backend
      const result = await api.redeemCoupon(coupon.id, user.id);

      // Verificar si ya lo tenía canjeado
      if (result.alreadyRedeemed) {
        alert(`ℹ️ Ya tienes este cupón en tu billetera\n\n${coupon.title}\nDescuento: ${coupon.discount}%\n\nPuedes usarlo en tu próxima compra`);
      } else {
        alert(`✅ ¡Cupón canjeado exitosamente!\n\n${coupon.title}\nDescuento: ${coupon.discount}%\n\nCosto: ${coupon.cost} FELICOINS\n\nTX: ${txHash.substring(0, 10)}...`);
      }

      // 3. Recargar cupones disponibles y del usuario
      const [couponsData, userCouponsData] = await Promise.all([
        api.getAvailableCoupons(),
        api.getUserCoupons(user.id)
      ]);

      setAvailableCoupons(couponsData);
      setUserCoupons(userCouponsData);

      console.log('✅ Cupón canjeado:', result);
    } catch (error) {
      console.error('❌ Error canjeando cupón:', error);
      if (error.code === 'ACTION_REJECTED') {
        alert('❌ Transacción rechazada');
      } else {
        const errorMsg = error.response?.data?.error || error.message || 'Error al canjear cupón';
        alert(`❌ ${errorMsg}`);
      }
    }
  };

  // Comprar ticket NFT para evento
  const handleBuyEventTicket = async (event) => {
    if (!user) {
      alert('⚠️ Por favor inicia sesión');
      return;
    }

    if (!isConnected) {
      alert('⚠️ Por favor conecta tu wallet');
      return;
    }

    if (parseFloat(feliBalance) < event.ticketPrice) {
      alert(`⚠️ Saldo insuficiente. Necesitas ${event.ticketPrice} FELICOINS`);
      return;
    }

    try {
      const { ethers } = await import('ethers');
      const ticketPrice = event.ticketPrice || event.price;
      const amount = ethers.parseEther(ticketPrice.toString());

      console.log('🎫 Comprando ticket NFT para:', event.name);
      console.log(`💰 Precio: ${ticketPrice} FELICOINS`);

      // 1. Transferir FELICOINS al contrato de pagos
      const paymentAddress = await contracts.loyalty.getAddress();
      const transferTx = await contracts.felicoin.transfer(paymentAddress, amount);
      const receipt = await transferTx.wait();
      const txHash = receipt.hash;

      console.log('✅ Pago realizado, TX:', txHash);

      // 2. Registrar en el backend
      const result = await api.buyEventTicket(event.id, user.id, txHash);

      alert(`✅ ¡Ticket NFT reservado exitosamente!\n\n${event.name}\nFecha: ${new Date(event.eventDate || event.date).toLocaleDateString()}\nPrecio: ${ticketPrice} FELICOINS\n\n⚠️ El NFT se acuñará cuando el evento sea registrado en blockchain\n\nTX: ${txHash.substring(0, 10)}...`);

      // 3. Recargar eventos y tickets del usuario
      console.log('🔄 Recargando eventos y NFTs del usuario...');
      const [eventsData, userNFTsData] = await Promise.all([
        api.getAvailableEvents(),
        api.getUserTickets(user.id)
      ]);

      console.log('📊 NFTs recibidos:', userNFTsData);
      console.log('📊 Total de NFTs:', userNFTsData.length);

      setNftEvents(eventsData);
      setUserNFTs(userNFTsData);

      console.log('✅ Ticket reservado:', result);
      console.log('✅ Estado actualizado - NFTs en memoria:', userNFTsData.length);
    } catch (error) {
      console.error('❌ Error comprando ticket:', error);
      if (error.code === 'ACTION_REJECTED') {
        alert('❌ Transacción rechazada');
      } else {
        const errorMsg = error.response?.data?.error || error.message || 'Error al comprar ticket';
        alert(`❌ ${errorMsg}`);
      }
    }
  };

  // Manejar staking (desde la calculadora o botón)
  const handleStaking = async () => {
    if (!isConnected) {
      alert('⚠️ Por favor conecta tu wallet primero');
      return;
    }

    if (!stakingAmount || parseFloat(stakingAmount) <= 0) {
      alert('⚠️ Por favor ingresa un monto válido');
      return;
    }

    if (parseFloat(stakingAmount) > parseFloat(feliBalance)) {
      alert('⚠️ Saldo insuficiente');
      return;
    }

    if (!contracts?.felicoin || !contracts?.staking) {
      alert('⚠️ Contratos no inicializados. Por favor reconecta tu wallet.');
      return;
    }

    try {
      const { ethers } = await import('ethers');
      const amount = ethers.parseEther(stakingAmount);

      console.log('🔒 Iniciando staking de', stakingAmount, 'FELICOINS');

      // 1. Aprobar tokens
      console.log('1️⃣ Aprobando tokens...');
      const stakingAddress = await contracts.staking.getAddress();
      const approveTx = await contracts.felicoin.approve(stakingAddress, amount);
      await approveTx.wait();
      console.log('✅ Tokens aprobados');

      // 2. Stake
      console.log('2️⃣ Haciendo stake...');
      const stakeTx = await contracts.staking.stake(amount);
      const txReceipt = await stakeTx.wait();
      console.log('✅ Stake completado');

      // 3. Guardar transacción en BD
      if (user?.id && txReceipt) {
        try {
          console.log('💾 Guardando transacción de staking en BD...');
          await api.post('/transactions', {
            txHash: txReceipt.hash,
            type: 'STAKING',
            userId: user.id,
            amount: stakingAmount,
            status: 'CONFIRMED',
            metadata: {
              action: 'stake',
              apy: membership.apy + '%',
              timestamp: new Date().toISOString()
            }
          });
          console.log('✅ Transacción de staking guardada');
        } catch (dbError) {
          console.warn('⚠️ Error guardando transacción de staking:', dbError);
        }
      }

      alert(`✅ Has hecho staking de ${stakingAmount} FELICOINS exitosamente!\n\nGanarás ${membership.apy}% APY`);

      // Limpiar y recargar
      setStakingAmount('');
      await reloadStakingInfo();
    } catch (error) {
      console.error('❌ Error haciendo staking:', error);
      if (error.code === 'ACTION_REJECTED') {
        alert('❌ Transacción rechazada por el usuario');
      } else {
        alert('❌ Error al hacer staking: ' + (error.message || 'Error desconocido'));
      }
    }
  };

  // Manejar unstaking
  const handleUnstaking = async () => {
    if (!stakingInfo || parseFloat(stakingInfo.amount) === 0) {
      alert('⚠️ No tienes staking activo');
      return;
    }

    const amountToUnstake = prompt(
      `Tienes ${parseFloat(stakingInfo.amount).toFixed(2)} FELICOINS en staking.\n\n¿Cuánto deseas retirar?`,
      parseFloat(stakingInfo.amount).toFixed(2)
    );

    if (!amountToUnstake || parseFloat(amountToUnstake) <= 0) {
      return;
    }

    if (parseFloat(amountToUnstake) > parseFloat(stakingInfo.amount)) {
      alert('⚠️ No puedes retirar más de lo que tienes en staking');
      return;
    }

    if (!contracts?.staking) {
      alert('⚠️ Contrato no inicializado. Por favor reconecta tu wallet.');
      return;
    }

    try {
      const { ethers } = await import('ethers');
      const amount = ethers.parseEther(amountToUnstake);

      console.log('🔓 Retirando', amountToUnstake, 'FELICOINS del staking');

      const withdrawTx = await contracts.staking.withdraw(amount);
      const txReceipt = await withdrawTx.wait();
      console.log('✅ Retiro completado');

      // Guardar transacción en BD
      if (user?.id && txReceipt) {
        try {
          console.log('💾 Guardando transacción de retiro en BD...');
          await api.post('/transactions', {
            txHash: txReceipt.hash,
            type: 'STAKING_WITHDRAW',
            userId: user.id,
            amount: amountToUnstake,
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

      alert(`✅ Has retirado ${amountToUnstake} FELICOINS del staking exitosamente!`);

      // Recargar info
      await reloadStakingInfo();
    } catch (error) {
      console.error('❌ Error retirando staking:', error);
      if (error.code === 'ACTION_REJECTED') {
        alert('❌ Transacción rechazada por el usuario');
      } else {
        alert('❌ Error al retirar: ' + (error.message || 'Error desconocido'));
      }
    }
  };

  // Manejar claim de rewards
  const handleClaimRewards = async () => {
    if (!stakingInfo || parseFloat(stakingInfo.pendingRewards) === 0) {
      alert('⚠️ No tienes recompensas pendientes para reclamar');
      return;
    }

    if (!contracts?.staking) {
      alert('⚠️ Contrato no inicializado. Por favor reconecta tu wallet.');
      return;
    }

    try {
      console.log('💰 Reclamando', stakingInfo.pendingRewards, 'FELICOINS de recompensas');

      const claimTx = await contracts.staking.claimRewards();
      const txReceipt = await claimTx.wait();
      console.log('✅ Recompensas reclamadas');

      // Guardar transacción en BD
      if (user?.id && txReceipt) {
        try {
          console.log('💾 Guardando transacción de recompensa en BD...');
          await api.post('/transactions', {
            txHash: txReceipt.hash,
            type: 'STAKING_REWARD',
            userId: user.id,
            amount: stakingInfo.pendingRewards,
            status: 'CONFIRMED',
            metadata: {
              action: 'claim_rewards',
              timestamp: new Date().toISOString()
            }
          });
          console.log('✅ Transacción de recompensa guardada');
        } catch (dbError) {
          console.warn('⚠️ Error guardando transacción de recompensa:', dbError);
        }
      }

      alert(`✅ Has reclamado ${stakingInfo.pendingRewards} FELICOINS de recompensas exitosamente!`);

      // Recargar info
      await reloadStakingInfo();
    } catch (error) {
      console.error('❌ Error reclamando rewards:', error);
      if (error.code === 'ACTION_REJECTED') {
        alert('❌ Transacción rechazada por el usuario');
      } else {
        alert('❌ Error al reclamar: ' + (error.message || 'Error desconocido'));
      }
    }
  };

  // Calcular nivel de membresía basado en transacciones y balance
  const calculateMembershipLevel = () => {
    // Si hay datos del backend, usarlos
    if (userMembership) {
      const levelConfig = {
        PLATINUM: {
          level: 'Platinum Member',
          color: 'from-purple-500 to-indigo-500',
          icon: Trophy
        },
        GOLD: {
          level: 'Gold Member',
          color: 'from-amber-400 to-yellow-600',
          icon: Award
        },
        SILVER: {
          level: 'Silver Member',
          color: 'from-slate-400 to-slate-600',
          icon: Star
        }
      };

      return {
        ...levelConfig[userMembership.level],
        apy: userMembership.apy,
        benefits: userMembership.benefits || []
      };
    }

    // Fallback: calcular localmente
    const balance = parseFloat(feliBalance) || 0;
    const xp = user?.xpPoints || 0;

    if (balance >= 10000 && xp >= 2000) {
      return {
        level: 'Platinum Member',
        color: 'from-purple-500 to-indigo-500',
        icon: Trophy,
        apy: 7.5,
        benefits: ['APY 7.5%', '15% Cashback', 'Acceso VIP', 'NFTs Exclusivos']
      };
    } else if (balance >= 5000 && xp >= 1000) {
      return {
        level: 'Gold Member',
        color: 'from-amber-400 to-yellow-600',
        icon: Award,
        apy: 5.4,
        benefits: ['APY 5.4%', '10% Cashback', 'Descuentos', 'Eventos']
      };
    } else {
      return {
        level: 'Silver Member',
        color: 'from-slate-400 to-slate-600',
        icon: Star,
        apy: 3.0,
        benefits: ['APY 3.0%', '5% Cashback', 'Acceso básico']
      };
    }
  };

  const membership = calculateMembershipLevel();

  // Cupones disponibles (ahora vienen del backend)
  // availableCoupons y nftEvents se cargan en el useEffect

  // Helper para obtener color del cupón según categoría
  const getCouponColor = (category) => {
    const colors = {
      'Tecnología': 'from-blue-500 to-cyan-500',
      'Cashback': 'from-emerald-500 to-green-500',
      'Envío': 'from-amber-500 to-orange-500',
      'Productos': 'from-rose-500 to-pink-500'
    };
    return colors[category] || 'from-slate-500 to-slate-600';
  };

  // Helper para calcular días hasta expiración
  const getDaysUntilExpiration = (expiresAt) => {
    if (!expiresAt) return 'Sin expiración';
    const days = Math.ceil((new Date(expiresAt) - new Date()) / (1000 * 60 * 60 * 24));
    return days > 0 ? `${days} días` : 'Expirado';
  };

  // Calcular recompensas de staking
  const calculateStakingRewards = (amount, days) => {
    const apy = membership.apy / 100;
    const dailyRate = apy / 365;
    return (amount * dailyRate * days).toFixed(2);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <Gift className="text-amber-500" size={32} />
          Premios y Staking
        </h1>
        <p className="text-slate-400 mt-1">Gana recompensas, canjea cupones y accede a eventos exclusivos</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-slate-800 overflow-x-auto">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-6 py-3 font-medium transition-colors relative ${
            activeTab === 'overview'
              ? 'text-amber-500'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          Resumen
          {activeTab === 'overview' && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-amber-500"></div>
          )}
        </button>
        <button
          onClick={() => setActiveTab('staking')}
          className={`px-6 py-3 font-medium transition-colors relative ${
            activeTab === 'staking'
              ? 'text-amber-500'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          Staking
          {activeTab === 'staking' && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-amber-500"></div>
          )}
        </button>
        <button
          onClick={() => setActiveTab('coupons')}
          className={`px-6 py-3 font-medium transition-colors relative ${
            activeTab === 'coupons'
              ? 'text-amber-500'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          Cupones
          {activeTab === 'coupons' && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-amber-500"></div>
          )}
        </button>
        <button
          onClick={() => setActiveTab('nfts')}
          className={`px-6 py-3 font-medium transition-colors relative ${
            activeTab === 'nfts'
              ? 'text-amber-500'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          Eventos NFT
          {activeTab === 'nfts' && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-amber-500"></div>
          )}
        </button>
        <button
          onClick={() => setActiveTab('mycoupons')}
          className={`px-6 py-3 font-medium transition-colors relative ${
            activeTab === 'mycoupons'
              ? 'text-amber-500'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          Mis Cupones
          {activeTab === 'mycoupons' && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-amber-500"></div>
          )}
        </button>
        <button
          onClick={() => setActiveTab('mynfts')}
          className={`px-6 py-3 font-medium transition-colors relative ${
            activeTab === 'mynfts'
              ? 'text-amber-500'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          Mis NFTs
          {activeTab === 'mynfts' && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-amber-500"></div>
          )}
        </button>
      </div>

      {/* Content based on active tab */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Membership Card */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className={`lg:col-span-1 p-8 rounded-3xl bg-gradient-to-br ${membership.color} relative overflow-hidden`}>
              <div className="absolute top-0 right-0 w-full h-full opacity-10">
                <div className="absolute inset-0 bg-[url('/pattern.svg')] bg-repeat"></div>
              </div>
              <div className="relative z-10 flex flex-col items-center text-center text-white">
                <div className="w-24 h-24 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-lg mb-4">
                  <membership.icon size={40} />
                </div>
                <h2 className="text-2xl font-bold">{membership.level}</h2>
                <p className="text-white/80 text-sm mt-2">Tu nivel actual de membresía</p>

                <div className="w-full mt-6 p-4 bg-white/10 backdrop-blur-sm rounded-xl">
                  <div className="text-sm font-medium mb-2">Beneficios:</div>
                  <ul className="space-y-1 text-sm text-white/90">
                    {membership.benefits.map((benefit, index) => (
                      <li key={index} className="flex items-center gap-2">
                        <CheckCircle size={16} />
                        {benefit}
                      </li>
                    ))}
                  </ul>
                </div>

                {membership.level !== 'Platinum Member' && (
                  <button className="mt-4 w-full py-2 bg-white/20 hover:bg-white/30 rounded-xl font-medium transition-colors">
                    Mejorar Nivel
                  </button>
                )}
              </div>
            </div>

            {/* Stats Cards */}
            <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800">
                <div className="flex items-start justify-between mb-4">
                  <div className="p-3 bg-emerald-500/10 rounded-xl">
                    <TrendingUp size={24} className="text-emerald-400" />
                  </div>
                  <span className="px-2 py-1 bg-emerald-500/10 text-emerald-400 text-xs font-bold rounded">
                    {stakingInfo && parseFloat(stakingInfo.amount) > 0 ? 'ACTIVO' : 'INACTIVO'}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 text-sm font-medium">Tu APY Actual</span>
                  <h3 className="text-4xl font-bold text-white mt-1">{membership.apy}%</h3>
                  <p className="text-xs text-slate-500 mt-2">
                    {stakingInfo && parseFloat(stakingInfo.amount) > 0
                      ? `Staking activo: ${parseFloat(stakingInfo.amount).toFixed(2)} FELICOINS`
                      : 'Sin staking activo'}
                  </p>
                </div>
              </div>

              <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800">
                <div className="flex items-start justify-between mb-4">
                  <div className="p-3 bg-amber-500/10 rounded-xl">
                    <Coins size={24} className="text-amber-400" />
                  </div>
                </div>
                <div>
                  <span className="text-slate-400 text-sm font-medium">Recompensas Pendientes</span>
                  <h3 className="text-4xl font-bold text-white mt-1">
                    {stakingInfo?.pendingRewards || '0'}
                  </h3>
                  <p className="text-xs text-slate-500 mt-2">FELICOINS disponibles para reclamar</p>
                </div>
              </div>

              <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800">
                <div className="flex items-start justify-between mb-4">
                  <div className="p-3 bg-blue-500/10 rounded-xl">
                    <Ticket size={24} className="text-blue-400" />
                  </div>
                </div>
                <div>
                  <span className="text-slate-400 text-sm font-medium">Cupones Disponibles</span>
                  <h3 className="text-4xl font-bold text-white mt-1">{availableCoupons.length}</h3>
                  <p className="text-xs text-slate-500 mt-2">Listos para canjear</p>
                </div>
              </div>

              <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800">
                <div className="flex items-start justify-between mb-4">
                  <div className="p-3 bg-purple-500/10 rounded-xl">
                    <Calendar size={24} className="text-purple-400" />
                  </div>
                </div>
                <div>
                  <span className="text-slate-400 text-sm font-medium">Eventos NFT</span>
                  <h3 className="text-4xl font-bold text-white mt-1">{nftEvents.length}</h3>
                  <p className="text-xs text-slate-500 mt-2">Próximos eventos disponibles</p>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <button
              onClick={() => setActiveTab('staking')}
              className="p-6 rounded-2xl bg-gradient-to-br from-emerald-500/10 to-green-500/10 border border-emerald-500/20 hover:border-emerald-500/40 transition-all group text-left"
            >
              <TrendingUp size={32} className="text-emerald-400 mb-3 group-hover:scale-110 transition-transform" />
              <h3 className="text-xl font-bold text-white mb-1">Hacer Staking</h3>
              <p className="text-slate-400 text-sm">Gana {membership.apy}% APY con tus FELICOINS</p>
            </button>

            <button
              onClick={() => setActiveTab('coupons')}
              className="p-6 rounded-2xl bg-gradient-to-br from-amber-500/10 to-orange-500/10 border border-amber-500/20 hover:border-amber-500/40 transition-all group text-left"
            >
              <Ticket size={32} className="text-amber-400 mb-3 group-hover:scale-110 transition-transform" />
              <h3 className="text-xl font-bold text-white mb-1">Canjear Cupones</h3>
              <p className="text-slate-400 text-sm">Descuentos exclusivos disponibles</p>
            </button>

            <button
              onClick={() => setActiveTab('nfts')}
              className="p-6 rounded-2xl bg-gradient-to-br from-purple-500/10 to-indigo-500/10 border border-purple-500/20 hover:border-purple-500/40 transition-all group text-left"
            >
              <Calendar size={32} className="text-purple-400 mb-3 group-hover:scale-110 transition-transform" />
              <h3 className="text-xl font-bold text-white mb-1">Eventos NFT</h3>
              <p className="text-slate-400 text-sm">Compra tickets exclusivos</p>
            </button>
          </div>
        </div>
      )}

      {/* Staking Tab - Continuaré en el siguiente bloque... */}

      {/* Staking Tab */}
      {activeTab === 'staking' && (
        <div className="space-y-6">
          {/* Staking Overview */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Current Staking */}
            <div className="p-8 rounded-3xl bg-slate-900 border border-slate-800">
              <h3 className="text-xl font-bold mb-6">Tu Staking Actual</h3>
              {stakingInfo && parseFloat(stakingInfo.amount) > 0 ? (
                <div className="space-y-4">
                  <div>
                    <span className="text-slate-400 text-sm">Amount Staked</span>
                    <div className="text-3xl font-bold text-white mt-1">
                      {parseFloat(stakingInfo.amount).toFixed(2)} FELICOINS
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="text-slate-400 text-xs">APY</span>
                      <div className="text-xl font-bold text-emerald-400">{membership.apy}%</div>
                    </div>
                    <div>
                      <span className="text-slate-400 text-xs">Ganancia Diaria</span>
                      <div className="text-xl font-bold text-white">
                        +{calculateStakingRewards(parseFloat(stakingInfo.amount), 1)} FELI
                      </div>
                    </div>
                  </div>
                  <div className="p-4 bg-emerald-500/10 rounded-xl">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-white">Recompensas Pendientes</span>
                      <span className="text-lg font-bold text-emerald-400">
                        {stakingInfo.pendingRewards} FELI
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <button
                      onClick={handleUnstaking}
                      className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-medium transition-colors"
                    >
                      Retirar
                    </button>
                    <button
                      onClick={handleClaimRewards}
                      disabled={!stakingInfo || parseFloat(stakingInfo.pendingRewards) === 0}
                      className={`flex-1 py-3 rounded-xl font-medium transition-colors ${
                        stakingInfo && parseFloat(stakingInfo.pendingRewards) > 0
                          ? 'bg-emerald-500 hover:bg-emerald-400 text-white'
                          : 'bg-slate-800 text-slate-600 cursor-not-allowed'
                      }`}
                    >
                      Reclamar Rewards
                    </button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="w-20 h-20 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Lock size={32} className="text-slate-600" />
                  </div>
                  <p className="text-slate-400 mb-6">No tienes staking activo</p>
                  <p className="text-sm text-slate-500 mb-6">
                    Usa la calculadora de la derecha para ver cuánto puedes ganar
                  </p>
                  {!isConnected && (
                    <button
                      onClick={() => alert('Por favor conecta tu wallet desde la sección Billetera')}
                      className="px-6 py-3 bg-amber-500 hover:bg-amber-400 text-slate-900 rounded-xl font-bold transition-colors"
                    >
                      Conectar Wallet
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Staking Calculator */}
            <div className="p-8 rounded-3xl bg-gradient-to-br from-emerald-500/10 to-green-500/10 border border-emerald-500/20">
              <h3 className="text-xl font-bold mb-6">Calculadora de Ganancias</h3>
              <div className="space-y-4">
                <div>
                  <label className="text-sm text-slate-400 block mb-2">Cantidad a Stakear</label>
                  <input
                    type="number"
                    placeholder="1000"
                    value={stakingAmount}
                    onChange={(e) => setStakingAmount(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-900 border border-slate-800 rounded-xl text-white focus:border-emerald-500 focus:outline-none"
                  />
                </div>

                <div className="space-y-3 p-4 bg-slate-900/50 rounded-xl">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Ganancia Diaria</span>
                    <span className="text-white font-bold">
                      +{stakingAmount ? calculateStakingRewards(parseFloat(stakingAmount), 1) : '0'} FELI
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Ganancia Mensual</span>
                    <span className="text-white font-bold">
                      +{stakingAmount ? calculateStakingRewards(parseFloat(stakingAmount), 30) : '0'} FELI
                    </span>
                  </div>
                  <div className="flex justify-between border-t border-slate-800 pt-3">
                    <span className="text-slate-400">Ganancia Anual</span>
                    <span className="text-emerald-400 font-bold text-lg">
                      +{stakingAmount ? calculateStakingRewards(parseFloat(stakingAmount), 365) : '0'} FELI
                    </span>
                  </div>
                </div>

                <div className="p-4 bg-blue-500/10 rounded-xl">
                  <div className="flex items-start gap-3">
                    <Info size={20} className="text-blue-400 flex-shrink-0 mt-0.5" />
                    <div className="text-sm text-slate-300">
                      <p className="font-medium mb-1">Información de Staking</p>
                      <ul className="text-xs text-slate-400 space-y-1">
                        <li>• Sin periodo de bloqueo</li>
                        <li>• Retira cuando quieras</li>
                        <li>• Recompensas diarias</li>
                        <li>• APY: {membership.apy}%</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <button
                  onClick={handleStaking}
                  disabled={!isConnected || !stakingAmount || parseFloat(stakingAmount) <= 0}
                  className={`w-full py-3 rounded-xl font-bold transition-colors ${
                    isConnected && stakingAmount && parseFloat(stakingAmount) > 0
                      ? 'bg-emerald-500 hover:bg-emerald-400 text-white'
                      : 'bg-slate-800 text-slate-600 cursor-not-allowed'
                  }`}
                >
                  {!isConnected ? 'Conecta tu Wallet' : 'Stakear Ahora'}
                </button>
              </div>
            </div>
          </div>

          {/* Historical Performance */}
          <div className="p-8 rounded-3xl bg-slate-900 border border-slate-800">
            <h3 className="text-xl font-bold mb-6">Rendimiento Histórico</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div>
                <span className="text-slate-400 text-sm">Total Stakeado</span>
                <div className="text-2xl font-bold text-white mt-1">
                  {stakingInfo ? parseFloat(stakingInfo.amount).toFixed(2) : '0'} FELI
                </div>
              </div>
              <div>
                <span className="text-slate-400 text-sm">Total Ganado</span>
                <div className="text-2xl font-bold text-emerald-400 mt-1">
                  {stakingInfo ? stakingInfo.pendingRewards : '0'} FELI
                </div>
              </div>
              <div>
                <span className="text-slate-400 text-sm">Días Activos</span>
                <div className="text-2xl font-bold text-white mt-1">
                  {stakingInfo && stakingInfo.stakedAt
                    ? Math.floor((new Date() - stakingInfo.stakedAt) / (1000 * 60 * 60 * 24))
                    : '0'}
                </div>
              </div>
              <div>
                <span className="text-slate-400 text-sm">APY Promedio</span>
                <div className="text-2xl font-bold text-white mt-1">{membership.apy}%</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Coupons Tab */}
      {activeTab === 'coupons' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">Cupones Disponibles</h2>
              <p className="text-slate-400 text-sm mt-1">
                Canjea tus FELICOINS por descuentos exclusivos
              </p>
            </div>
            <div className="text-right">
              <span className="text-slate-400 text-sm">Tu balance</span>
              <div className="text-2xl font-bold text-white">{feliBalance} FELICOINS</div>
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500 mx-auto mb-4"></div>
                <p className="text-slate-400">Cargando cupones...</p>
              </div>
            </div>
          ) : availableCoupons.length === 0 ? (
            <div className="text-center py-12">
              <Ticket size={48} className="text-slate-600 mx-auto mb-4" />
              <p className="text-slate-400 text-lg">No hay cupones disponibles</p>
              <p className="text-slate-500 text-sm mt-2">Vuelve pronto para ver nuevos cupones</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {availableCoupons.map((coupon) => {
                const couponColor = getCouponColor(coupon.category);
                return (
                <div
                  key={coupon.id}
                  className="p-6 rounded-3xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all group relative overflow-hidden"
                >
                  <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${couponColor} opacity-10 blur-3xl`}></div>

                  <div className="relative z-10">
                    <div className="flex items-start justify-between mb-4">
                      <div className={`p-3 bg-gradient-to-br ${couponColor} bg-opacity-10 rounded-xl`}>
                        <Ticket size={24} className="text-white" />
                      </div>
                      <span className="px-3 py-1 bg-slate-800 text-xs font-bold rounded-full">
                        {coupon.category}
                      </span>
                    </div>

                    <h3 className="text-lg font-bold text-white mb-2">{coupon.title}</h3>
                    <p className="text-sm text-slate-400 mb-4">{coupon.description}</p>

                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <span className="text-xs text-slate-500">Descuento</span>
                        <div className={`text-2xl font-bold bg-gradient-to-r ${couponColor} bg-clip-text text-transparent`}>
                          {coupon.discount}%
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-xs text-slate-500">Costo</span>
                        <div className="text-xl font-bold text-white">{coupon.cost} FELI</div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 text-xs text-slate-500 mb-4">
                      <Clock size={14} />
                      <span>Expira en {getDaysUntilExpiration(coupon.expiresAt)}</span>
                    </div>

                    <button
                      onClick={() => handleRedeemCoupon(coupon)}
                      disabled={parseFloat(feliBalance) < coupon.cost}
                      className={`w-full py-3 rounded-xl font-bold transition-all ${
                        parseFloat(feliBalance) >= coupon.cost
                          ? 'bg-amber-500 hover:bg-amber-400 text-slate-900'
                          : 'bg-slate-800 text-slate-600 cursor-not-allowed'
                      }`}
                    >
                      {parseFloat(feliBalance) >= coupon.cost ? 'Canjear Ahora' : 'Saldo Insuficiente'}
                    </button>
                  </div>
                </div>
              );
            })}
            </div>
          )}
        </div>
      )}

      {/* NFT Events Tab */}
      {activeTab === 'nfts' && (
        <div className="space-y-6">
          <div>
            <h2 className="text-2xl font-bold">Eventos NFT Exclusivos</h2>
            <p className="text-slate-400 text-sm mt-1">
              Compra tickets NFT para eventos especiales
            </p>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
                <p className="text-slate-400">Cargando eventos...</p>
              </div>
            </div>
          ) : nftEvents.length === 0 ? (
            <div className="text-center py-12">
              <Calendar size={48} className="text-slate-600 mx-auto mb-4" />
              <p className="text-slate-400 text-lg">No hay eventos disponibles</p>
              <p className="text-slate-500 text-sm mt-2">Próximamente nuevos eventos exclusivos</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {nftEvents.map((event) => (
              <div
                key={event.id}
                className="rounded-3xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all overflow-hidden group"
              >
                <div className="relative h-48 bg-gradient-to-br from-purple-500/20 to-indigo-500/20">
                  <div className="absolute inset-0 bg-[url('/pattern.svg')] opacity-10"></div>
                  <div className="absolute top-4 right-4 px-3 py-1 bg-slate-900/80 backdrop-blur-sm rounded-full text-xs font-bold flex items-center gap-1">
                    {event.verified ? (
                      <>
                        <CheckCircle size={14} className="text-emerald-400" />
                        <span className="text-emerald-400">Verificado</span>
                      </>
                    ) : (
                      <>
                        <Clock size={14} className="text-amber-400" />
                        <span className="text-amber-400">Pendiente</span>
                      </>
                    )}
                  </div>
                </div>

                <div className="p-6">
                  <h3 className="text-xl font-bold text-white mb-2">{event.name}</h3>

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2 text-sm text-slate-400">
                      <Calendar size={16} />
                      <span>{new Date(event.eventDate || event.date).toLocaleDateString('es-ES', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-slate-400">
                      <Ticket size={16} />
                      <span>{event.location}</span>
                    </div>
                  </div>

                  <div className="mb-4">
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-slate-400">Tickets disponibles</span>
                      <span className="text-white font-medium">{event.maxTickets - event.ticketsSold} / {event.maxTickets}</span>
                    </div>
                    <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-purple-500 to-indigo-500 transition-all"
                        style={{ width: `${((event.maxTickets - event.ticketsSold) / event.maxTickets) * 100}%` }}
                      ></div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xs text-slate-500">Precio</span>
                      <div className="text-2xl font-bold text-white">{event.ticketPrice || event.price} FELI</div>
                    </div>
                    <button
                      onClick={() => handleBuyEventTicket(event)}
                      disabled={parseFloat(feliBalance) < (event.ticketPrice || event.price) || event.ticketsSold >= event.maxTickets}
                      className={`px-6 py-3 rounded-xl font-bold transition-all flex items-center gap-2 ${
                        parseFloat(feliBalance) >= (event.ticketPrice || event.price) && event.ticketsSold < event.maxTickets
                          ? 'bg-purple-500 hover:bg-purple-400 text-white'
                          : 'bg-slate-800 text-slate-600 cursor-not-allowed'
                      }`}
                    >
                      {event.ticketsSold >= event.maxTickets ? 'Agotado' : 'Comprar Ticket'}
                      {event.ticketsSold < event.maxTickets && <ArrowUpRight size={16} />}
                    </button>
                  </div>
                </div>
              </div>
            ))}
            </div>
          )}
        </div>
      )}

      {/* Mis Cupones Tab */}
      {activeTab === 'mycoupons' && (
        <div className="space-y-6">
          <div>
            <h2 className="text-2xl font-bold">Mis Cupones</h2>
            <p className="text-slate-400 text-sm mt-1">
              Cupones que has canjeado y puedes usar en tus compras
            </p>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500 mx-auto mb-4"></div>
                <p className="text-slate-400">Cargando tus cupones...</p>
              </div>
            </div>
          ) : userCoupons.length === 0 ? (
            <div className="text-center py-12">
              <Ticket size={48} className="text-slate-600 mx-auto mb-4" />
              <p className="text-slate-400 text-lg">No tienes cupones canjeados</p>
              <p className="text-slate-500 text-sm mt-2">Visita la pestaña de Cupones para canjear descuentos</p>
              <button
                onClick={() => setActiveTab('coupons')}
                className="mt-4 px-6 py-2 bg-amber-500 hover:bg-amber-400 rounded-xl font-medium transition-colors"
              >
                Ver Cupones Disponibles
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {userCoupons.map((userCoupon) => {
                const coupon = userCoupon.coupon || userCoupon;
                const gradient = {
                  'Tecnología': 'from-blue-500 to-cyan-500',
                  'Deportes': 'from-green-500 to-emerald-500',
                  'Envío': 'from-amber-500 to-orange-500',
                  'Hogar': 'from-purple-500 to-pink-500'
                }[coupon.category] || 'from-slate-500 to-slate-600';

                return (
                  <div
                    key={userCoupon.id}
                    className="rounded-3xl bg-slate-900 border border-slate-800 overflow-hidden group hover:border-amber-500/50 transition-all"
                  >
                    <div className={`h-32 bg-gradient-to-br ${gradient} relative`}>
                      <div className="absolute inset-0 bg-[url('/pattern.svg')] opacity-10"></div>
                      <div className="absolute top-4 right-4 px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-xs font-bold text-white">
                        {coupon.discount}% OFF
                      </div>
                      <div className="absolute bottom-4 left-4 text-white">
                        <Ticket size={32} />
                      </div>
                    </div>

                    <div className="p-6">
                      <h3 className="text-lg font-bold text-white mb-2">{coupon.title}</h3>
                      <p className="text-slate-400 text-sm mb-4">{coupon.description}</p>

                      <div className="space-y-2 mb-4">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-slate-500">Estado:</span>
                          <span className={`font-medium ${userCoupon.used ? 'text-slate-500' : 'text-green-400'}`}>
                            {userCoupon.used ? '✓ Usado' : '✓ Disponible'}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-slate-500">Canjeado:</span>
                          <span className="text-slate-400">
                            {new Date(userCoupon.redeemedAt).toLocaleDateString('es-ES')}
                          </span>
                        </div>
                        {userCoupon.used && userCoupon.usedAt && (
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-slate-500">Usado:</span>
                            <span className="text-slate-400">
                              {new Date(userCoupon.usedAt).toLocaleDateString('es-ES')}
                            </span>
                          </div>
                        )}
                      </div>

                      {!userCoupon.used && (
                        <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl">
                          <p className="text-amber-400 text-xs font-medium">
                            💡 Aplica automáticamente en tu próxima compra
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Mis NFTs Tab */}
      {activeTab === 'mynfts' && (
        <div className="space-y-6">
          <div>
            <h2 className="text-2xl font-bold">Mis NFTs de Eventos</h2>
            <p className="text-slate-400 text-sm mt-1">
              Tickets NFT de eventos que has comprado
            </p>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
                <p className="text-slate-400">Cargando tus NFTs...</p>
              </div>
            </div>
          ) : userNFTs.length === 0 ? (
            <div className="text-center py-12">
              <Image size={48} className="text-slate-600 mx-auto mb-4" />
              <p className="text-slate-400 text-lg">No tienes NFTs de eventos</p>
              <p className="text-slate-500 text-sm mt-2">Compra tickets para eventos exclusivos</p>
              <button
                onClick={() => setActiveTab('nfts')}
                className="mt-4 px-6 py-2 bg-purple-500 hover:bg-purple-400 rounded-xl font-medium transition-colors"
              >
                Ver Eventos Disponibles
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {userNFTs.map((ticket) => {
                const event = ticket.event || ticket;

                return (
                  <div
                    key={ticket.id}
                    className="rounded-3xl bg-slate-900 border border-slate-800 hover:border-purple-500/50 transition-all overflow-hidden group"
                  >
                    <div className="relative h-48 bg-gradient-to-br from-purple-500/20 to-indigo-500/20">
                      <div className="absolute inset-0 bg-[url('/pattern.svg')] opacity-10"></div>
                      <div className="absolute top-4 right-4 px-3 py-1 bg-slate-900/80 backdrop-blur-sm rounded-full text-xs font-bold">
                        <span className="text-purple-400">NFT #{ticket.tokenId || 'Pendiente'}</span>
                      </div>
                      <div className="absolute bottom-4 left-4 right-4">
                        <div className="flex items-center gap-2 text-white">
                          <Calendar size={20} />
                          <span className="text-sm font-medium">
                            {new Date(event.eventDate || event.date).toLocaleDateString('es-ES', {
                              day: '2-digit',
                              month: 'short',
                              year: 'numeric'
                            })}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="p-6">
                      <h3 className="text-xl font-bold text-white mb-2">{event.name}</h3>
                      <p className="text-slate-400 text-sm mb-4 line-clamp-2">{event.description}</p>

                      <div className="space-y-2 mb-4">
                        <div className="flex items-center gap-2 text-sm text-slate-400">
                          <MapPin size={16} />
                          <span>{event.location}</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-slate-500">Comprado:</span>
                          <span className="text-slate-400">
                            {new Date(ticket.purchasedAt || ticket.createdAt).toLocaleDateString('es-ES')}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-slate-500">Precio pagado:</span>
                          <span className="text-amber-400 font-bold">
                            {ticket.pricePaid || event.ticketPrice || event.price} FELICOINS
                          </span>
                        </div>
                      </div>

                      <div className={`p-3 rounded-xl border ${
                        ticket.tokenId 
                          ? 'bg-green-500/10 border-green-500/20'
                          : 'bg-amber-500/10 border-amber-500/20'
                      }`}>
                        <p className={`text-xs font-medium ${
                          ticket.tokenId ? 'text-green-400' : 'text-amber-400'
                        }`}>
                          {ticket.tokenId
                            ? '✓ NFT acuñado en blockchain'
                            : '⏳ NFT pendiente de acuñación'}
                        </p>
                        {ticket.txHash && (
                          <p className="text-slate-500 text-xs mt-1 truncate">
                            TX: {ticket.txHash}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default RewardsView;

