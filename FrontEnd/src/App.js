// Felistore - Main App Component with Web3 Integration
import React, { useState, useEffect } from 'react';
import {
  Eye, 
  EyeOff, 
  User, 
  Send, 
  Zap, 
  Home, 
  Wallet, 
  Bell,
  X,
  Search,
  ArrowRight,
  ShoppingBag, 
  ShoppingCart, 
  Star, 
  Tag, 
  CheckCircle, 
  Plus, 
  Store,
  QrCode,
  ArrowUpRight,
  ArrowDownLeft,
  Gift, 
  History,
  Scan,
  LogOut,
  ChevronRight,
  ChevronLeft,
  LayoutDashboard,
  Settings,
  CreditCard,
  TrendingUp,
  AlertCircle
} from 'lucide-react';
import WalletView from './pages/WalletViewWeb3.js';
import HistoryView from './pages/HistoryView.js';
import ProfileView from './pages/ProfileView.js';
import SettingsView from './pages/SettingsView.js';
import ProductDetail from './pages/ProductDetail.js';
import RewardsView from './pages/RewardsView.js';
import { useProducts } from './hooks/useProducts.js';
import api, { checkApiHealth } from './services/api.js';
import { useAuth } from './context/AuthContext.js';
import { WalletButton } from './components/WalletConnect.js';
import Web3Provider, {useWeb3} from "./context/Web3Context.js";

const AppContent = () => {
  // Web3 Context
  const { account, contracts, feliBalance, updateBalances } = useWeb3();
  const [showBalance, setShowBalance] = useState(true);
  const [currentView, setCurrentView] = useState('home'); 
  const [cart, setCart] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [apiConnected, setApiConnected] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [walletModalToOpen, setWalletModalToOpen] = useState(null);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [purchaseError, setPurchaseError] = useState(null);
  const [purchaseSuccess, setPurchaseSuccess] = useState(null); // 'send', 'receive', o null

  // Estados del buscador
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showSearchResults, setShowSearchResults] = useState(false);

  // Estado para sidebar colapsado
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Resetear producto seleccionado cuando se cambia de vista
  useEffect(() => {
    if (currentView !== 'market') {
      setSelectedProduct(null);
    }
  }, [currentView]);

  // Escuchar eventos personalizados para cambiar de vista
  useEffect(() => {
    const handleChangeView = (event) => {
      setCurrentView(event.detail);
    };

    window.addEventListener('changeView', handleChangeView);

    return () => {
      window.removeEventListener('changeView', handleChangeView);
    };
  }, []);

  // Obtener productos desde la API
  const { products: apiProducts, loading: productsLoading, error: productsError } = useProducts();

  // Obtener datos del usuario desde AuthContext
  const { user: authUser, isAuthenticated, logout } = useAuth();

  // Datos de Usuario (usar datos reales si está autenticado, sino mostrar invitado)
  const userData = authUser ? {
    name: authUser.nickname || authUser.name || "Usuario",
    lastName: "",
    totalBalance: feliBalance * 0.05, // Convertir FELI a USD aproximado (1 FELI = 0.05 USD)
    feliBalance: feliBalance, // Balance real desde Web3
    rewardsLevel: authUser.role === 'ADMIN' ? "Platinum Member" : "Gold Member",
    apy: 5.4,
    email: authUser.email,
    walletAddress: authUser.walletAddress || account,
    isVerified: authUser.isVerified,
    nickname: authUser.nickname,
    fullName: authUser.name
  } : {
    name: "Invitado",
    lastName: "",
    totalBalance: feliBalance * 0.05,
    feliBalance: feliBalance, // Balance real desde Web3 incluso para invitados
    rewardsLevel: "Guest",
    apy: 0
  };

  // Productos fallback (si la API no está disponible)
  const fallbackProducts = [
    {
      id: 1, 
      name: "Smart Watch Ultra", 
      category: "Tech",
      priceFELI: 2500,
      cashback: 150,
      rating: 4.8,
      imageColor: "bg-indigo-600",
      description: "Monitoreo de salud Web3 con integración directa a tu wallet."
    },
    { 
      id: 2, 
      name: "Sneakers NFT Edition", 
      category: "Moda",
      priceFELI: 1200,
      cashback: 100,
      rating: 4.9,
      imageColor: "bg-rose-600",
      description: "Zapatillas físicas que incluyen su gemelo digital para el metaverso."
    },
    { 
      id: 3, 
      name: "Café Especialidad (1kg)", 
      category: "Gourmet",
      priceFELI: 300,
      cashback: 15,
      rating: 4.7,
      imageColor: "bg-amber-700",
      description: "Grano entero, origen único. Trazabilidad completa en blockchain."
    },
    { 
      id: 4, 
      name: "Cloud Storage 1TB", 
      category: "Servicios",
      priceFELI: 5000,
      cashback: 500,
      rating: 5.0,
      imageColor: "bg-sky-600",
      description: "Almacenamiento descentralizado y encriptado. Privacidad total."
    },
    { 
      id: 5, 
      name: "Curso Trading Pro", 
      category: "Educación",
      priceFELI: 4500,
      cashback: 450,
      rating: 4.6,
      imageColor: "bg-emerald-600",
      description: "Aprende a operar mercados cripto con expertos."
    },
    { 
      id: 6, 
      name: "Ticket VIP Concierto", 
      category: "Eventos",
      priceFELI: 8000,
      cashback: 800,
      rating: 4.9,
      imageColor: "bg-purple-600",
      description: "Acceso exclusivo y Meet & Greet."
    }
  ];

  // Normalizar productos de API para que coincidan con el formato esperado
  const normalizeProduct = (product) => ({
    ...product,
    priceFELI: product.priceFELI || 0,
    priceUSD: product.priceUSD || 0,
    imageColor: product.imageColor || getRandomColor(),
    cashback: product.cashback || Math.floor((product.priceFELI || 0) * 0.05)
  });

  // Función para asignar color aleatorio si no tiene
  const getRandomColor = () => {
    const colors = [
      'bg-indigo-600',
      'bg-rose-600',
      'bg-amber-700',
      'bg-sky-600',
      'bg-emerald-600',
      'bg-purple-600',
      'bg-pink-600',
      'bg-cyan-600'
    ];
    return colors[Math.floor(Math.random() * colors.length)];
  };

  // Usar productos de API si están disponibles, sino usar fallback
  const products = apiProducts.length > 0
    ? apiProducts.map(normalizeProduct)
    : fallbackProducts;

  // Efecto para debuggear productos
  useEffect(() => {
    console.log('📦 Productos cargados:', products.length);
    if (products.length > 0) {
      console.log('📦 Primer producto:', products[0]);
    }
  }, [products]);

  // Efecto para debuggear selectedProduct
  useEffect(() => {
    if (selectedProduct) {
      console.log('🔍 Producto seleccionado ID:', selectedProduct);
      console.log('🔍 Vista actual:', currentView);
    }
  }, [selectedProduct, currentView]);

  // Verificar conexión con el backend al cargar
  useEffect(() => {
    const checkBackend = async () => {
      const health = await checkApiHealth();
      setApiConnected(health !== null);

      if (health) {
        console.log('✅ Backend conectado:', health);
      } else {
        console.warn('⚠️ Backend no disponible - usando datos de ejemplo');
      }
    };

    checkBackend();
  }, []);

  // Lógica del Carrito
  const addToCart = (product) => {
    console.log('🛒 Agregando producto al carrito:', {
      id: product.id,
      name: product.name,
      priceFELI: product.priceFELI,
      cashback: product.cashback
    });

    if (!product.priceFELI) {
      console.error('❌ Producto sin precio FELICOINS:', product);
      alert('Error: El producto no tiene un precio válido');
      return;
    }

    setCart([...cart, product]);
    setIsCartOpen(true);
  };
  const removeFromCart = (productId) => setCart(cart.filter(item => item.id !== productId));
  const cartTotal = cart.reduce((acc, item) => acc + (item.priceFELI || 0), 0);
  const cashbackTotal = cart.reduce((acc, item) => acc + (item.cashback || 0), 0);

  // Función para proceder al checkout
  const handleProceedToCheckout = () => {
    console.log('🛒 Intentando ir al checkout...');
    console.log('👤 Account:', account);
    console.log('📦 Carrito:', cart.length, 'productos');

    if (!account) {
      alert('Por favor conecta tu wallet primero');
      return;
    }
    if (cart.length === 0) {
      alert('Tu carrito está vacío');
      return;
    }

    console.log('✅ Abriendo modal de checkout...');
    setIsCartOpen(false);
    setIsCheckoutOpen(true);
  };

  // Función para procesar la compra con blockchain
  const handlePurchase = async () => {
    console.log('💳 Iniciando compra...');
    console.log('👤 Account:', account);
    console.log('📜 Contracts:', contracts);
    console.log('🪙 Felicoin contract:', contracts?.felicoin);
    console.log('💰 Loyalty contract:', contracts?.loyaltyPayment);

    if (!account) {
      setPurchaseError('Por favor conecta tu wallet primero');
      return;
    }

    if (!contracts?.loyalty || !contracts?.felicoin) {
      console.error('❌ Contratos no disponibles');
      console.error('Contracts object:', contracts);
      setPurchaseError('Contratos no inicializados. Por favor reconecta tu wallet o espera un momento.');
      return;
    }

    setIsPurchasing(true);
    setPurchaseError(null);

    try {
      const { ethers } = await import('ethers');

      // Validar que el carrito tenga productos y el total sea válido
      if (cart.length === 0) {
        throw new Error('El carrito está vacío');
      }

      if (isNaN(cartTotal) || cartTotal <= 0) {
        console.error('❌ Cart total inválido:', cartTotal);
        console.error('🛒 Cart items:', cart);
        throw new Error('Error calculando el total del carrito. Por favor, recarga la página.');
      }

      // Calcular total (en wei)
      const totalAmount = ethers.parseEther((cartTotal + 5).toString());

      console.log('🛒 Procesando compra...');
      console.log('📦 Productos:', cart.length);
      console.log('💰 Total:', ethers.formatEther(totalAmount), 'FELICOINS');

      // 1. Aprobar tokens al contrato Loyalty
      console.log('✅ Paso 1: Aprobando tokens...');
      const approveTx = await contracts.felicoin.approve(
        await contracts.loyalty.getAddress(),
        totalAmount
      );
      await approveTx.wait();
      console.log('✅ Tokens aprobados');

      // 2. Obtener dirección del merchant (deployer por defecto)
      // En producción, esto vendría del backend
      const merchantAddress = '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266'; // Deployer de Hardhat

      // 3. Procesar cada producto
      const purchases = [];
      for (const product of cart) {
        console.log(`📦 Comprando: ${product.name}...`);
        console.log(`💰 Precio: ${product.priceFELI} FELICOINS`);

        const productAmount = ethers.parseEther(product.priceFELI.toString());

        // Llamar al contrato de pagos (processPurchase)
        // Parámetros: (merchant, amount)
        const purchaseTx = await contracts.loyalty.processPurchase(
          merchantAddress,
          productAmount
        );

        const receipt = await purchaseTx.wait();
        console.log(`✅ ${product.name} comprado! TX: ${receipt.hash}`);

        purchases.push({
          product: product.name,
          txHash: receipt.hash,
          amount: product.priceFELI,
          cashback: product.cashback
        });
      }

      // 4. Guardar transacciones en la base de datos
      console.log('💾 Guardando transacciones en BD...');
      try {
        if (authUser?.id) {
          const transactionPromises = purchases.map(purchase => {
            // Buscar el producto en el carrito para obtener su ID
            const cartItem = cart.find(item => item.name === purchase.product);
            
            return api.post('/transactions', {
              userId: authUser.id,
              type: 'PURCHASE',
              txHash: purchase.txHash,
              productId: cartItem?.id || null,
              amount: purchase.amount.toString(),
              status: 'CONFIRMED',
              metadata: {
                productName: purchase.product,
                cashback: purchase.cashback,
                timestamp: new Date().toISOString()
              },
              blockNumber: null
            }).catch(err => {
              console.warn('⚠️ Error guardando transacción:', err.response?.data || err.message);
              return null;
            });
          });

          await Promise.all(transactionPromises);
          console.log('✅ Transacciones guardadas en BD');
        }
      } catch (error) {
        console.warn('⚠️ No se pudieron guardar las transacciones en BD:', error);
        // No bloquear el flujo si falla el guardado
      }

      // 5. Mostrar éxito
      setPurchaseSuccess({
        totalPaid: cartTotal + 5,
        totalCashback: cashbackTotal,
        purchases: purchases
      });

      // 6. Limpiar carrito
      setCart([]);

      // 7. Actualizar balances
      if (updateBalances) {
        await updateBalances();
      }

      console.log('🎉 ¡Compra completada exitosamente!');

      // Cerrar modal después de 5 segundos
      setTimeout(() => {
        setIsCheckoutOpen(false);
        setPurchaseSuccess(null);
      }, 5000);

    } catch (error) {
      console.error('❌ Error en la compra:', error);

      let errorMessage = 'Error al procesar la compra';

      if (error.code === 'ACTION_REJECTED') {
        errorMessage = 'Transacción rechazada por el usuario';
      } else if (error.message.includes('insufficient funds')) {
        errorMessage = 'Fondos insuficientes. Necesitas más FELICOINS.';
      } else if (error.message.includes('execution reverted')) {
        errorMessage = 'Transacción fallida. Verifica que tengas suficiente balance.';
      } else {
        errorMessage = error.message || errorMessage;
      }

      setPurchaseError(errorMessage);
    } finally {
      setIsPurchasing(false);
    }
  };

  // Función de búsqueda
  const handleSearch = (query) => {
    setSearchQuery(query);

    if (query.length < 2) {
      setSearchResults([]);
      setShowSearchResults(false);
      return;
    }

    // Buscar en productos
    const results = products.filter(product =>
      product.name.toLowerCase().includes(query.toLowerCase()) ||
      product.description?.toLowerCase().includes(query.toLowerCase()) ||
      product.category?.toLowerCase().includes(query.toLowerCase())
    );

    setSearchResults(results);
    setShowSearchResults(true);
  };

  // Seleccionar resultado de búsqueda
  const selectSearchResult = (product) => {
    setSelectedProduct(product.id);
    setCurrentView('market');
    setSearchQuery('');
    setShowSearchResults(false);
  };

  // Formateador
  const formatNum = (num) => new Intl.NumberFormat('en-US').format(num);

  return (
    <div className="flex min-h-screen bg-slate-950 font-sans text-white overflow-hidden">
        {/* Fondo Ambiental Global */}
        <div className="fixed top-[-20%] left-[-10%] w-[40%] h-[40%] bg-amber-600/10 rounded-full blur-[150px] pointer-events-none"></div>
        <div className="fixed bottom-[-10%] right-[-10%] w-[30%] h-[30%] bg-indigo-600/10 rounded-full blur-[150px] pointer-events-none"></div>

        {/* --- SIDEBAR --- */}
        <aside className={`${sidebarCollapsed ? 'w-20' : 'w-64'} bg-slate-900 border-r border-slate-800 flex flex-col z-20 transition-all duration-300 relative`}>
            {/* Botón para colapsar/expandir */}
            <button
                onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                className="absolute -right-3 top-8 w-6 h-6 bg-slate-800 border border-slate-700 rounded-full flex items-center justify-center hover:bg-slate-700 transition-all shadow-lg z-30 group"
                title={sidebarCollapsed ? 'Expandir sidebar' : 'Colapsar sidebar'}
            >
                <ChevronLeft size={14} className={`text-slate-400 group-hover:text-white transition-transform ${sidebarCollapsed ? 'rotate-180' : ''}`} />
            </button>

            {/* Logo Area */}
            <div className={`p-6 flex items-center ${sidebarCollapsed ? 'justify-center' : 'gap-3'} overflow-hidden`}>
                <img src="/Felimarket.png" alt="Felimarket" className={`${sidebarCollapsed ? 'h-8' : 'h-10'} w-auto`} />
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-4 space-y-2 overflow-y-auto scrollbar-none" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                <SidebarItem collapsed={sidebarCollapsed} icon={<LayoutDashboard size={20} />} label="Dashboard" active={currentView === 'home'} onClick={() => setCurrentView('home')} />
                <SidebarItem collapsed={sidebarCollapsed} icon={<Store size={20} />} label="Marketplace" active={currentView === 'market'} onClick={() => setCurrentView('market')} />
                <SidebarItem collapsed={sidebarCollapsed} icon={<Wallet size={20} />} label="Billetera" active={currentView === 'wallet'} onClick={() => setCurrentView('wallet')} />
                <SidebarItem collapsed={sidebarCollapsed} icon={<Gift size={20} />} label="Premios y Staking" active={currentView === 'rewards'} onClick={() => setCurrentView('rewards')} />
                <SidebarItem collapsed={sidebarCollapsed} icon={<History size={20} />} label="Historial" active={currentView === 'history'} onClick={() => setCurrentView('history')} />

                {!sidebarCollapsed && <div className="pt-8 pb-2 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Configuración</div>}
                <SidebarItem collapsed={sidebarCollapsed} icon={<User size={20} />} label="Perfil" active={currentView === 'profile'} onClick={() => setCurrentView('profile')} />
                <SidebarItem collapsed={sidebarCollapsed} icon={<Settings size={20} />} label="Ajustes" active={currentView === 'settings'} onClick={() => setCurrentView('settings')} />
            </nav>

            {/* User Mini Profile */}
            {sidebarCollapsed ? (
                <div className="p-4 flex items-center justify-center">
                    <div
                        onClick={() => setCurrentView('profile')}
                        className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-white font-bold cursor-pointer hover:shadow-lg hover:shadow-amber-500/30 transition-all group relative"
                        title={`${authUser?.nickname || userData.name} - ${userData.rewardsLevel}`}
                    >
                        {(authUser?.nickname || userData.name)[0].toUpperCase()}

                        {/* Tooltip en versión colapsada */}
                        <div className="absolute left-full ml-2 px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all whitespace-nowrap z-50">
                            <p className="text-xs font-bold text-white">{authUser?.nickname || userData.name}</p>
                            <p className="text-xs text-amber-500">{userData.rewardsLevel}</p>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="p-4 flex items-center gap-3 mx-4 rounded-xl bg-slate-800/50 transition-all">
                    <div
                        onClick={() => setCurrentView('profile')}
                        className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-white font-bold cursor-pointer hover:shadow-lg hover:shadow-amber-500/30 transition-all flex-shrink-0"
                    >
                        {(authUser?.nickname || userData.name)[0].toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0 cursor-pointer" onClick={() => setCurrentView('profile')}>
                        <h4 className="text-sm font-bold truncate text-white">{authUser?.nickname || userData.name}</h4>
                        <span className="text-xs text-amber-500 block font-medium">{userData.rewardsLevel}</span>
                    </div>
                    <button
                        onClick={() => {
                            logout();
                            window.location.href = '/login';
                        }}
                        className="text-slate-500 hover:text-rose-500 transition-colors p-1 hover:bg-slate-800 rounded-lg"
                        title="Cerrar Sesión"
                    >
                        <LogOut size={16} />
                    </button>
                </div>
            )}
        </aside>

        {/* --- MAIN CONTENT AREA --- */}
        <div className="flex-1 flex flex-col h-screen overflow-hidden relative">

            {/* TOP BAR */}
            <header className="h-20 border-b border-slate-800 bg-slate-950/80 backdrop-blur-md flex items-center justify-between px-8 relative z-50">
                {/* Search */}
                <div className="relative w-96">
                    <Search className="absolute left-3 top-2.5 text-slate-500" size={18} />
                    <input 
                        type="text" 
                        placeholder="Buscar productos, transacciones..." 
                        value={searchQuery}
                        onChange={(e) => handleSearch(e.target.value)}
                        onFocus={() => searchQuery.length >= 2 && setShowSearchResults(true)}
                        onBlur={() => setTimeout(() => setShowSearchResults(false), 200)}
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl py-2 pl-10 pr-4 text-sm text-white focus:outline-none focus:border-amber-500/50 transition-colors"
                    />

                    {/* Resultados de búsqueda */}
                    {showSearchResults && searchResults.length > 0 && (
                        <div className="absolute top-full mt-2 w-full bg-slate-900 border border-slate-800 rounded-xl shadow-xl overflow-hidden z-50">
                            <div className="p-2 border-b border-slate-800">
                                <p className="text-xs text-slate-400 px-2">
                                    {searchResults.length} resultado{searchResults.length !== 1 ? 's' : ''} encontrado{searchResults.length !== 1 ? 's' : ''}
                                </p>
                            </div>
                            <div className="max-h-96 overflow-y-auto">
                                {searchResults.map(product => (
                                    <div
                                        key={product.id}
                                        onClick={() => selectSearchResult(product)}
                                        className="p-3 hover:bg-slate-800 cursor-pointer transition-colors flex items-center gap-3"
                                    >
                                        <div className={`w-12 h-12 rounded-lg ${product.imageColor || 'bg-slate-700'} flex items-center justify-center flex-shrink-0`}>
                                            <span className="text-2xl">{product.icon || '📦'}</span>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h4 className="text-sm font-bold text-white truncate">{product.name}</h4>
                                            <p className="text-xs text-slate-400 truncate">{product.description}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-sm font-bold text-amber-500">{formatNum(product.priceFELI || 0)} FELICOINS</p>
                                            <p className="text-xs text-slate-500">${formatNum(product.priceUSD || 0)}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Sin resultados */}
                    {showSearchResults && searchQuery.length >= 2 && searchResults.length === 0 && (
                        <div className="absolute top-full mt-2 w-full bg-slate-900 border border-slate-800 rounded-xl shadow-xl p-4 z-50">
                            <p className="text-sm text-slate-400 text-center">
                                No se encontraron resultados para "{searchQuery}"
                            </p>
                        </div>
                    )}
                </div>

                {/* Right Actions */}
                <div className="flex items-center gap-3 relative z-[100]">
                    {/* Indicador API */}
                    <div
                        className="relative group flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all cursor-help"
                        title={apiConnected ? 'Backend conectado y funcionando' : 'Backend no disponible'}
                    >
                        <div className={`w-2 h-2 rounded-full ${apiConnected ? 'bg-emerald-500 shadow-lg shadow-emerald-500/50' : 'bg-amber-500 shadow-lg shadow-amber-500/50'} animate-pulse`}></div>
                        <span className={`text-xs font-medium ${apiConnected ? 'text-emerald-400' : 'text-amber-400'}`}>
                            {apiConnected ? 'API Conectada' : 'Modo Local'}
                        </span>

                        {/* Tooltip */}
                        <div className="absolute top-full mt-2 right-0 w-64 bg-slate-900 border border-slate-800 rounded-xl p-3 shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
                            <div className="flex items-start gap-2">
                                <div className={`w-3 h-3 rounded-full ${apiConnected ? 'bg-emerald-500' : 'bg-amber-500'} mt-0.5 flex-shrink-0`}></div>
                                <div>
                                    <p className={`text-xs font-bold mb-1 ${apiConnected ? 'text-emerald-400' : 'text-amber-400'}`}>
                                        {apiConnected ? 'Backend Online' : 'Sin Conexión'}
                                    </p>
                                    <p className="text-xs text-slate-400">
                                        {apiConnected
                                            ? 'Base de datos y servicios funcionando correctamente. Todos los datos son reales.'
                                            : 'Backend no disponible. Usando datos de ejemplo locales.'
                                        }
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Botón de MetaMask */}
                    <WalletButton />

                    <button
                        onClick={() => setCurrentView('history')}
                        className="p-2.5 rounded-full bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:border-slate-600 transition-all relative"
                        title="Notificaciones"
                    >
                        <Bell size={20} />
                        <span className="absolute top-2 right-2.5 w-2 h-2 bg-rose-500 rounded-full border-2 border-slate-900"></span>
                    </button>

                    <button 
                        onClick={() => setIsCartOpen(true)}
                        className="p-2.5 rounded-full bg-slate-900 border border-slate-800 text-slate-400 hover:text-amber-500 hover:border-amber-500/50 transition-all relative"
                        title="Carrito de Compras"
                    >
                        <ShoppingCart size={20} />
                        {cart.length > 0 && (
                            <span className="absolute -top-1 -right-1 w-5 h-5 bg-amber-500 text-slate-900 rounded-full text-xs flex items-center justify-center font-bold">
                                {cart.length}
                            </span>
                        )}
                    </button>

                    <button
                        onClick={() => setCurrentView('profile')}
                        className="p-2.5 rounded-full bg-gradient-to-tr from-amber-500 to-orange-600 text-white hover:shadow-lg hover:shadow-amber-500/20 transition-all"
                        title="Mi Perfil"
                    >
                        <User size={20} />
                    </button>
                </div>
            </header>

            {/* SCROLLABLE CONTENT */}
            <main className="flex-1 overflow-y-auto p-8 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent">
                
                {currentView === 'home' && (
                    <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        
                        {/* Welcome & Quick Stats */}
                        <div>
                            <h1 className="text-3xl font-bold mb-1">Hola de nuevo, {userData.name} 👋</h1>
                            <p className="text-slate-400">Aquí tienes el resumen de tu actividad hoy.</p>
                        </div>

                        {/* Top Dashboard Grid */}
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            
                            {/* 1. Main Balance Card (Wider) */}
                            <div className="lg:col-span-2 p-8 rounded-[2rem] bg-gradient-to-br from-slate-900 via-slate-900 to-indigo-950 border border-slate-800 relative overflow-hidden group">
                                <div className="absolute right-0 top-0 w-64 h-64 bg-amber-500/10 blur-[80px] rounded-full group-hover:bg-amber-500/20 transition-all duration-700"></div>
                                
                                <div className="flex justify-between items-start relative z-10">
                                    <div>
                                        <div className="flex items-center gap-2 mb-2">
                                            <span className="px-2 py-1 bg-amber-500/10 border border-amber-500/20 text-amber-500 rounded text-xs font-bold uppercase tracking-wider">Wallet Principal</span>
                                            <span className="text-slate-400 text-xs">ERC-20</span>
                                        </div>
                                        <div className="flex items-end gap-3 mb-1">
                                            <h2 className="text-5xl font-bold text-white tracking-tight">
                                                {showBalance ? formatNum(userData.feliBalance) : "••••••"}
                                            </h2>
                                            <span className="text-2xl font-bold text-amber-500 mb-2">FELICOINS</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-slate-400">
                                            <span>≈ ${formatNum(userData.totalBalance)} USD</span>
                                            <button onClick={() => setShowBalance(!showBalance)} className="hover:text-white transition-colors">
                                                {showBalance ? <Eye size={16} /> : <EyeOff size={16} />}
                                            </button>
                                        </div>
                                    </div>
                                    {/* Action Buttons inside Card */}
                                    <div className="flex gap-3">
                                        <button
                                            onClick={() => {
                                                setWalletModalToOpen('send');
                                                setCurrentView('wallet');
                                            }}
                                            className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-900 font-bold rounded-xl text-sm transition-colors flex items-center gap-2 shadow-lg shadow-amber-500/20"
                                        >
                                            <ArrowUpRight size={18} /> Enviar
                                        </button>
                                        <button
                                            onClick={() => {
                                                setWalletModalToOpen(null);
                                                setCurrentView('wallet');
                                            }}
                                            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white font-medium rounded-xl text-sm transition-colors flex items-center gap-2"
                                        >
                                            <Wallet size={18} /> Ver Billetera
                                        </button>
                                    </div>
                                </div>

                                {/* Mini Stats Row */}
                                <div className="mt-8 pt-6 border-t border-white/5 grid grid-cols-3 gap-8 relative z-10">
                                    <div>
                                        <span className="block text-slate-500 text-xs uppercase mb-1">Cashback Mes</span>
                                        <span className="text-lg font-bold text-emerald-400 flex items-center gap-1"><Zap size={14} fill="currentColor"/> +450 FELICOINS</span>
                                    </div>
                                    <div>
                                        <span className="block text-slate-500 text-xs uppercase mb-1">Staking APY</span>
                                        <span className="text-lg font-bold text-indigo-400">{userData.apy}%</span>
                                    </div>
                                    <div>
                                        <span className="block text-slate-500 text-xs uppercase mb-1">Puntos Nivel</span>
                                        <span className="text-lg font-bold text-white">1,250 XP</span>
                                    </div>
                                </div>
                            </div>

                            {/* 2. Quick Actions & Promo (Right Side) */}
                            <div className="space-y-6">
                                {/* Actions Grid */}
                                <div className="grid grid-cols-2 gap-4">
                                    <button
                                        onClick={() => {
                                            setWalletModalToOpen('receive');
                                            setCurrentView('wallet');
                                        }}
                                        className="p-6 rounded-2xl bg-purple-400/10 border border-purple-400/20 hover:border-purple-400/40 transition-all text-left group cursor-pointer"
                                    >
                                        <div className="text-purple-400 mb-2 group-hover:scale-110 transition-transform">
                                            <QrCode size={24} />
                                        </div>
                                        <div className="text-sm font-bold text-white">Mi QR</div>
                                        <div className="text-xs text-slate-400 mt-1">Para recibir</div>
                                    </button>
                                    <button
                                        onClick={() => setCurrentView('rewards')}
                                        className="p-6 rounded-2xl bg-rose-400/10 border border-rose-400/20 hover:border-rose-400/40 transition-all text-left group cursor-pointer"
                                    >
                                        <div className="text-rose-400 mb-2 group-hover:scale-110 transition-transform">
                                            <Gift size={24} />
                                        </div>
                                        <div className="text-sm font-bold text-white">Canjear</div>
                                        <div className="text-xs text-slate-400 mt-1">Premios</div>
                                    </button>
                                    <button
                                        onClick={() => {
                                            setWalletModalToOpen('receive');
                                            setCurrentView('wallet');
                                        }}
                                        className="p-6 rounded-2xl bg-emerald-400/10 border border-emerald-400/20 hover:border-emerald-400/40 transition-all text-left group cursor-pointer"
                                    >
                                        <div className="text-emerald-400 mb-2 group-hover:scale-110 transition-transform">
                                            <ArrowDownLeft size={24} />
                                        </div>
                                        <div className="text-sm font-bold text-white">Recibir</div>
                                        <div className="text-xs text-slate-400 mt-1">FELICOINS</div>
                                    </button>
                                    <button
                                        onClick={() => {
                                            setWalletModalToOpen('staking');
                                            setCurrentView('wallet');
                                        }}
                                        className="p-6 rounded-2xl bg-blue-400/10 border border-blue-400/20 hover:border-blue-400/40 transition-all text-left group cursor-pointer"
                                    >
                                        <div className="text-blue-400 mb-2 group-hover:scale-110 transition-transform">
                                            <TrendingUp size={24} />
                                        </div>
                                        <div className="text-sm font-bold text-white">Staking</div>
                                        <div className="text-xs text-slate-400 mt-1">Ganar 5.4%</div>
                                    </button>
                                </div>

                                {/* Promo Banner Small */}
                                <div 
                                    onClick={() => setCurrentView('market')}
                                    className="p-5 rounded-2xl bg-gradient-to-r from-amber-600 to-orange-600 text-white relative overflow-hidden cursor-pointer group hover:shadow-xl hover:shadow-amber-500/10 transition-all"
                                >
                                    <div className="relative z-10">
                                        <span className="px-2 py-1 bg-white/20 rounded-md text-[10px] font-bold uppercase mb-2 inline-block">Nuevo</span>
                                        <h3 className="text-lg font-bold">Tech Week Sale</h3>
                                        <p className="text-sm text-white/80 mt-1">Hasta 20% Cashback pagando con Felicoins.</p>
                                    </div>
                                    <Tag className="absolute -right-4 -bottom-4 text-white/20 w-24 h-24 transform rotate-12 group-hover:scale-110 transition-transform" />
                                </div>
                            </div>
                        </div>

                        {/* Marketplace Teaser */}
                        <div>
                            <div className="flex justify-between items-end mb-6">
                                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                                    <Store className="text-amber-500" size={24}/> Destacados del Mercado
                                </h3>
                                <button onClick={() => setCurrentView('market')} className="text-sm text-amber-500 font-bold hover:text-amber-400 flex items-center gap-1 transition-colors">
                                    Ver todo el catálogo <ArrowRight size={16}/>
                                </button>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                {products.slice(0, 4).map((product) => (
                                    <ProductCard
                                        key={product.id}
                                        product={product}
                                        onAdd={() => addToCart(product)}
                                        onClick={() => {
                                            setCurrentView('market');
                                            setSelectedProduct(product.id);
                                        }}
                                    />
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {currentView === 'market' && !selectedProduct && (
                    <div className="max-w-7xl mx-auto space-y-6 animate-in fade-in slide-in-from-right-8 duration-500">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                            <div>
                                <h1 className="text-3xl font-bold">Marketplace</h1>
                                <p className="text-slate-400">Explora productos y servicios pagables con FELICOINS.</p>
                            </div>
                            <div className="flex gap-2">
                                {["Todo", "Tech", "Moda", "Gourmet", "Servicios"].map((cat, i) => (
                                    <button key={i} className={`px-4 py-2 rounded-xl text-sm font-bold transition-colors ${i === 0 ? 'bg-amber-500 text-slate-900' : 'bg-slate-900 text-slate-400 border border-slate-800 hover:border-slate-600'}`}>
                                        {cat}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                             {products.map((product) => (
                                <ProductCard
                                    key={product.id}
                                    product={product}
                                    onAdd={() => addToCart(product)}
                                    onClick={() => setSelectedProduct(product.id)}
                                />
                            ))}
                        </div>
                    </div>
                )}

                {currentView === 'market' && selectedProduct && (
                    <ProductDetail
                        productId={selectedProduct}
                        onBack={() => setSelectedProduct(null)}
                        onAddToCart={addToCart}
                    />
                )}

                {currentView === 'rewards' && <RewardsView />}

                {currentView === 'wallet' && (
                    <WalletView
                        autoOpenModal={walletModalToOpen}
                        onModalOpened={() => setWalletModalToOpen(null)}
                    />
                )}
                {currentView === 'history' && <HistoryView />}
                {currentView === 'profile' && <ProfileView />}
                {currentView === 'settings' && <SettingsView />}

            </main>
        </div>

        {/* --- CART DRAWER (Slide Over) --- */}
        {isCartOpen && (
            <div className="fixed inset-0 z-50 flex justify-end">
                <div className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity" onClick={() => setIsCartOpen(false)}></div>
                <div className="relative w-full max-w-md bg-slate-900 h-full border-l border-slate-800 shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
                    <div className="p-6 border-b border-slate-800 flex justify-between items-center">
                        <h2 className="text-xl font-bold flex items-center gap-2">
                            <ShoppingCart size={20} className="text-amber-500"/> Tu Carrito
                        </h2>
                        <button onClick={() => setIsCartOpen(false)} className="p-2 hover:bg-slate-800 rounded-full transition-colors">
                            <X size={20} className="text-slate-400"/>
                        </button>
                    </div>

                    <div className="flex-1 overflow-y-auto p-6 space-y-4">
                        {cart.length === 0 ? (
                            <div className="h-full flex flex-col items-center justify-center text-slate-500">
                                <ShoppingBag size={48} className="mb-4 opacity-20"/>
                                <p>Tu carrito está vacío.</p>
                                <button onClick={() => { setIsCartOpen(false); setCurrentView('market'); }} className="mt-4 text-amber-500 font-bold hover:underline">
                                    Ir a comprar
                                </button>
                            </div>
                        ) : (
                            cart.map((item, idx) => (
                                <div key={`${item.id}-${idx}`} className="flex gap-4 p-4 bg-slate-950/50 rounded-xl border border-slate-800">
                                    <div className={`w-16 h-16 rounded-lg ${item.imageColor} shrink-0 flex items-center justify-center`}>
                                        <ShoppingBag size={20} className="text-white/50" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h4 className="font-bold text-sm text-white truncate">{item.name}</h4>
                                        <div className="text-slate-400 text-xs mt-1">{formatNum(item.priceFELI || 0)} FELICOINS</div>
                                        <div className="text-emerald-400 text-[10px] mt-1 font-bold">+ {item.cashback || 0} Cashback</div>
                                    </div>
                                    <button onClick={() => removeFromCart(item.id)} className="text-slate-500 hover:text-rose-500 p-2">
                                        <X size={16} />
                                    </button>
                                </div>
                            ))
                        )}
                    </div>

                    {cart.length > 0 && (
                        <div className="p-6 bg-slate-950 border-t border-slate-800">
                            <div className="flex justify-between mb-2 text-sm">
                                <span className="text-slate-400">Subtotal</span>
                                <span className="text-white font-medium">{formatNum(cartTotal)} FELICOINS</span>
                            </div>
                            <div className="flex justify-between mb-4 text-sm">
                                <span className="text-slate-400">Fee de Red</span>
                                <span className="text-white font-medium">5 FELICOINS</span>
                            </div>
                            <div className="flex justify-between mb-6 pt-4 border-t border-slate-800">
                                <span className="text-lg font-bold text-white">Total</span>
                                <span className="text-2xl font-bold text-amber-500">{formatNum(cartTotal + 5)} FELICOINS</span>
                            </div>
                            
                            <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-3 mb-4 flex items-center gap-2">
                                <Zap size={16} className="text-emerald-400" fill="currentColor"/>
                                <span className="text-xs text-emerald-400 font-medium">Ganarás <strong className="text-emerald-300">+{formatNum(cashbackTotal)} FELICOINS</strong> en esta compra.</span>
                            </div>

                            <button
                                onClick={handleProceedToCheckout}
                                className="w-full py-3.5 bg-gradient-to-r from-amber-500 to-orange-600 rounded-xl font-bold text-slate-900 hover:shadow-lg hover:shadow-amber-500/20 transition-all flex justify-center items-center gap-2"
                            >
                                Proceder al Pago <ArrowRight size={18} />
                            </button>
                        </div>
                    )}
                </div>
            </div>
        )}

        {/* --- CHECKOUT MODAL --- */}
        {isCheckoutOpen && (
            <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
                <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => !isPurchasing && setIsCheckoutOpen(false)}></div>

                <div className="relative w-full max-w-lg bg-slate-900 rounded-2xl border border-slate-800 shadow-2xl overflow-hidden">
                    {/* Header */}
                    <div className="p-6 border-b border-slate-800 bg-gradient-to-r from-amber-500/10 to-orange-500/10">
                        <div className="flex justify-between items-center">
                            <div>
                                <h2 className="text-2xl font-bold flex items-center gap-2">
                                    <ShoppingBag className="text-amber-500" size={24}/>
                                    Confirmar Compra
                                </h2>
                                <p className="text-slate-400 text-sm mt-1">Revisa tu pedido antes de finalizar</p>
                            </div>
                            {!isPurchasing && !purchaseSuccess && (
                                <button onClick={() => setIsCheckoutOpen(false)} className="p-2 hover:bg-slate-800 rounded-full transition-colors">
                                    <X size={20} className="text-slate-400"/>
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Content */}
                    <div className="p-6 max-h-[60vh] overflow-y-auto scrollbar-thin">
                        {!purchaseSuccess ? (
                            <>
                                {/* Lista de productos */}
                                <div className="space-y-3 mb-6">
                                    {cart.map((item, idx) => (
                                        <div key={`checkout-${item.id}-${idx}`} className="flex items-center gap-3 p-3 bg-slate-950/50 rounded-xl border border-slate-800">
                                            <div className={`w-12 h-12 rounded-lg ${item.imageColor} flex items-center justify-center shrink-0`}>
                                                <ShoppingBag size={16} className="text-white/50" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h4 className="font-bold text-sm text-white truncate">{item.name}</h4>
                                                <div className="text-xs text-slate-400 mt-0.5">{formatNum(item.priceFELI || 0)} FELICOINS</div>
                                            </div>
                                            <div className="text-emerald-400 text-xs font-bold">
                                                +{item.cashback}
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* Resumen */}
                                <div className="bg-slate-950/50 rounded-xl p-4 border border-slate-800 space-y-3 mb-6">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-slate-400">Subtotal ({cart.length} productos)</span>
                                        <span className="font-medium">{formatNum(cartTotal)} FELICOINS</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-slate-400">Fee de Red</span>
                                        <span className="font-medium">5 FELICOINS</span>
                                    </div>
                                    <div className="flex justify-between text-sm pt-3 border-t border-slate-800">
                                        <span className="text-slate-400">Cashback Total</span>
                                        <span className="text-emerald-400 font-bold">+{formatNum(cashbackTotal)} FELICOINS</span>
                                    </div>
                                    <div className="flex justify-between pt-3 border-t border-slate-800">
                                        <span className="text-lg font-bold">Total a Pagar</span>
                                        <span className="text-2xl font-bold text-amber-500">{formatNum(cartTotal + 5)} FELICOINS</span>
                                    </div>
                                </div>

                                {/* Información de wallet */}
                                {account && (
                                    <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-xl p-4 mb-6">
                                        <div className="flex items-start gap-3">
                                            <Wallet size={20} className="text-indigo-400 mt-0.5" />
                                            <div className="flex-1">
                                                <p className="text-xs font-medium text-indigo-300 mb-1">Pagando desde:</p>
                                                <code className="text-xs text-indigo-400 break-all">{account}</code>
                                                <p className="text-xs text-slate-400 mt-2">Balance: {parseFloat(feliBalance).toFixed(2)} FELICOINS</p>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Error */}
                                {purchaseError && (
                                    <div className="bg-rose-500/10 border border-rose-500/20 rounded-xl p-4 mb-6">
                                        <div className="flex items-start gap-3">
                                            <AlertCircle size={20} className="text-rose-400 mt-0.5" />
                                            <div className="flex-1">
                                                <p className="text-sm font-medium text-rose-300 mb-1">Error en la compra</p>
                                                <p className="text-xs text-rose-400">{purchaseError}</p>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Loading state */}
                                {isPurchasing && (
                                    <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 mb-6">
                                        <div className="flex items-center gap-3">
                                            <div className="animate-spin rounded-full h-5 w-5 border-2 border-amber-500 border-t-transparent"></div>
                                            <div className="flex-1">
                                                <p className="text-sm font-medium text-amber-300 mb-1">Procesando compra...</p>
                                                <p className="text-xs text-amber-400">Por favor confirma las transacciones en MetaMask</p>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </>
                        ) : (
                            /* Success State */
                            <div className="text-center py-8">
                                <div className="w-20 h-20 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
                                    <CheckCircle size={40} className="text-emerald-400" />
                                </div>
                                <h3 className="text-2xl font-bold text-white mb-2">¡Compra Exitosa!</h3>
                                <p className="text-slate-400 mb-6">Tu pedido ha sido procesado correctamente</p>

                                <div className="bg-slate-950/50 rounded-xl p-4 border border-slate-800 space-y-2 mb-6 text-left">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-slate-400">Total Pagado:</span>
                                        <span className="font-bold text-amber-500">{formatNum(purchaseSuccess.totalPaid)} FELICOINS</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-slate-400">Cashback Ganado:</span>
                                        <span className="font-bold text-emerald-400">+{formatNum(purchaseSuccess.totalCashback)} FELICOINS</span>
                                    </div>
                                    <div className="flex justify-between text-sm pt-2 border-t border-slate-800">
                                        <span className="text-slate-400">Productos Comprados:</span>
                                        <span className="font-bold">{purchaseSuccess.purchases.length}</span>
                                    </div>
                                </div>

                                <p className="text-xs text-slate-500">Este modal se cerrará automáticamente...</p>
                            </div>
                        )}
                    </div>

                    {/* Footer con botones */}
                    {!purchaseSuccess && (
                        <div className="p-6 bg-slate-950 border-t border-slate-800 flex gap-3">
                            <button
                                onClick={() => setIsCheckoutOpen(false)}
                                disabled={isPurchasing}
                                className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handlePurchase}
                                disabled={isPurchasing || !account}
                                className="flex-1 py-3 bg-gradient-to-r from-amber-500 to-orange-600 text-slate-900 font-bold rounded-xl hover:shadow-lg hover:shadow-amber-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                {isPurchasing ? (
                                    <>
                                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-slate-900 border-t-transparent"></div>
                                        Procesando...
                                    </>
                                ) : (
                                    <>
                                        <Zap size={18} fill="currentColor" />
                                        Confirmar Compra
                                    </>
                                )}
                            </button>
                        </div>
                    )}
                </div>
            </div>
        )}
    </div>
  );
};

// Wrapper principal con Web3Provider
const App = () => {
  return (
    <Web3Provider>
      <AppContent />
    </Web3Provider>
  );
};

// --- Subcomponentes para la Plataforma ---

const SidebarItem = ({ icon, label, active, onClick, collapsed }) => (
    <div className="relative group">
        <button
            onClick={onClick}
            className={`w-full flex items-center ${collapsed ? 'justify-center' : 'gap-3'} px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${active ? 'bg-amber-500/10 text-amber-500' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}
            title={collapsed ? label : ''}
        >
            <span className={`${active ? 'text-amber-500' : 'text-slate-500 group-hover:text-white'}`}>{icon}</span>
            {!collapsed && (
                <>
                    {label}
                    {active && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-amber-500 shadow-sm shadow-amber-500/50"></div>}
                </>
            )}
        </button>

        {/* Tooltip cuando está colapsado */}
        {collapsed && (
            <div className="absolute left-full ml-2 px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all whitespace-nowrap z-50 top-1/2 -translate-y-1/2">
                <p className="text-xs font-medium text-white">{label}</p>
            </div>
        )}
    </div>
);

const QuickActionCard = ({ icon, label, color, bg, border }) => (
    <div className={`flex flex-col items-center justify-center p-4 rounded-2xl border ${bg} ${border} cursor-pointer hover:scale-[1.02] transition-transform`}>
        <div className={`mb-2 ${color}`}>{icon}</div>
        <span className={`text-xs font-bold ${color}`}>{label}</span>
    </div>
);

const ProductCard = ({ product, onAdd, onClick }) => (
    <div
        className="group bg-slate-900 border border-slate-800 rounded-2xl p-4 hover:border-amber-500/30 transition-all hover:shadow-xl hover:shadow-black/50 flex flex-col cursor-pointer"
        onClick={onClick}
    >
        <div className={`w-full aspect-[4/3] rounded-xl ${product.imageColor} mb-4 relative flex items-center justify-center overflow-hidden`}>
            <ShoppingBag size={48} className="text-white/20 group-hover:scale-110 transition-transform duration-500" />
            
            <div className="absolute top-3 right-3 px-2 py-1 bg-black/50 backdrop-blur-md rounded-lg flex items-center gap-1 border border-white/10">
                <Star size={12} className="text-yellow-400" fill="currentColor"/>
                <span className="text-xs font-bold text-white">{product.rating || 4.5}</span>
            </div>

            <div className="absolute bottom-3 left-3">
                 <span className="px-2 py-1 bg-emerald-500/90 text-slate-900 text-[10px] font-bold rounded flex items-center gap-1 shadow-lg">
                    <Zap size={10} fill="currentColor"/> +{product.cashback} Back
                </span>
            </div>
        </div>

        <div className="flex-1 flex flex-col">
            <div className="flex justify-between items-start mb-1">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{product.category}</span>
            </div>
            <h4 className="font-bold text-white text-lg leading-tight mb-2 group-hover:text-amber-500 transition-colors">{product.name}</h4>
            <p className="text-xs text-slate-400 mb-4 line-clamp-2">{product.description}</p>
            
            <div className="mt-auto flex items-center justify-between pt-4 border-t border-slate-800">
                <div>
                    <span className="block text-xs text-slate-500">Precio</span>
                    <div className="font-bold text-white">
                        {new Intl.NumberFormat('en-US').format(product.priceFELI || 0)}
                        <span className="text-amber-500 text-xs ml-1">FELICOINS</span>
                    </div>
                </div>
                <button 
                    onClick={(e) => {
                        e.stopPropagation();
                        onAdd();
                    }}
                    className="w-10 h-10 rounded-xl bg-slate-800 text-amber-500 flex items-center justify-center hover:bg-amber-500 hover:text-slate-900 transition-all shadow-lg"
                >
                    <Plus size={20} />
                </button>
            </div>
        </div>
    </div>
);

export default App;