import React, { createContext, useContext, useState, useEffect } from 'react';
import { ethers } from 'ethers';
import contractsConfig from '../config/contracts.js';

// Usar configuración importada
const { addresses, abis, network } = contractsConfig;

// Crear contexto
const Web3Context = createContext();

// Hook personalizado para usar el contexto
export const useWeb3 = () => {
  const context = useContext(Web3Context);
  if (!context) {
    throw new Error('useWeb3 debe usarse dentro de Web3Provider');
  }
  return context;
};

// Provider del contexto
export const Web3Provider = ({ children }) => {
  // Estados
  const [account, setAccount] = useState(null);
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [contracts, setContracts] = useState({});
  const [balance, setBalance] = useState('0');
  const [feliBalance, setFeliBalance] = useState('0');
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState(null);
  const [chainId, setChainId] = useState(null);

  // Verificar si MetaMask está instalado
  const isMetaMaskInstalled = () => {
    return typeof window !== 'undefined' && typeof window.ethereum !== 'undefined';
  };

  // Conectar wallet
  const connectWallet = async () => {
    if (!isMetaMaskInstalled()) {
      setError('Por favor instala MetaMask');
      return;
    }

    try {
      setIsConnecting(true);
      setError(null);

      // Solicitar acceso a la cuenta
      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts'
      });

      if (accounts.length === 0) {
        throw new Error('No se encontraron cuentas');
      }

      const currentAccount = accounts[0];
      console.log('✅ Wallet conectada:', currentAccount);

      // Crear provider y signer
      const providerInstance = new ethers.BrowserProvider(window.ethereum);
      const signerInstance = await providerInstance.getSigner();
      const network = await providerInstance.getNetwork();

      setAccount(currentAccount);
      setProvider(providerInstance);
      setSigner(signerInstance);
      setChainId(network.chainId.toString());

      // Inicializar contratos
      const contractsInstance = await initializeContracts(signerInstance);

      if (contractsInstance) {
        // Actualizar balances
        await updateBalances(currentAccount, contractsInstance);
      }

      console.log('✅ Wallet conectada exitosamente');

      return currentAccount;
    } catch (err) {
      console.error('Error conectando wallet:', err);
      setError(err.message);
      throw err;
    } finally {
      setIsConnecting(false);
    }
  };

  // Desconectar wallet
  const disconnectWallet = () => {
    setAccount(null);
    setProvider(null);
    setSigner(null);
    setContracts({});
    setBalance('0');
    setFeliBalance('0');
    setChainId(null);
    console.log('✅ Wallet desconectada');
  };

  // Inicializar contratos
  const initializeContracts = async (signerInstance) => {
    try {
      if (!addresses || !abis) {
        console.error('❌ Configuración de contratos no disponible');
        return null;
      }

      console.log('📜 Inicializando contratos...');
      console.log('Addresses:', addresses);

      const felicoinContract = new ethers.Contract(
        addresses.FelicoinToken,
        abis.FelicoinToken,
        signerInstance
      );

      const loyaltyContract = new ethers.Contract(
        addresses.LoyaltyPayment,
        abis.LoyaltyPayment,
        signerInstance
      );

      const eventTicketContract = new ethers.Contract(
        addresses.EventTicket,
        abis.EventTicket,
        signerInstance
      );

      const stakingContract = new ethers.Contract(
        addresses.FelicoinStaking,
        abis.FelicoinStaking,
        signerInstance
      );

      const identityContract = new ethers.Contract(
        addresses.IdentityRegistry,
        abis.IdentityRegistry,
        signerInstance
      );

      setContracts({
        felicoin: felicoinContract,
        loyalty: loyaltyContract,
        eventTicket: eventTicketContract,
        staking: stakingContract,
        identity: identityContract
      });

      console.log('✅ Contratos inicializados correctamente');

      return {
        felicoin: felicoinContract,
        loyalty: loyaltyContract,
        eventTicket: eventTicketContract,
        staking: stakingContract,
        identity: identityContract
      };
    } catch (err) {
      console.error('❌ Error inicializando contratos:', err);
      setError('Error al inicializar contratos');
      return null;
    }
  };

  // Actualizar balances
  const updateBalances = async (address, contractsInstance) => {
    try {
      if (!address || !contractsInstance) {
        console.warn('⚠️ No se puede actualizar balances sin address o contratos');
        return;
      }

      console.log('🔄 Actualizando balances para:', address);

      // Obtener balance ETH
      const providerInstance = provider || new ethers.BrowserProvider(window.ethereum);
      const ethBalance = await providerInstance.getBalance(address);
      setBalance(ethers.formatEther(ethBalance));

      // Obtener balance FELI
      if (contractsInstance.felicoin) {
        const feliBalance = await contractsInstance.felicoin.balanceOf(address);
        setFeliBalance(ethers.formatEther(feliBalance));
        console.log('💰 Balance FELI:', ethers.formatEther(feliBalance));
      }
    } catch (err) {
      console.error('❌ Error actualizando balances:', err);
    }
  };

  // Obtener balance de FELI
  const getFeliBalance = async (address) => {
    if (!contracts.felicoin || !address) return '0';

    try {
      const balance = await contracts.felicoin.balanceOf(address);
      return ethers.formatEther(balance);
    } catch (err) {
      console.error('Error obteniendo balance FELI:', err);
      return '0';
    }
  };

  // Aprobar tokens
  const approveTokens = async (spenderAddress, amount) => {
    if (!contracts.felicoin) {
      throw new Error('Contrato Felicoin no inicializado');
    }

    try {
      const amountWei = ethers.parseEther(amount.toString());
      const tx = await contracts.felicoin.approve(spenderAddress, amountWei);
      const receipt = await tx.wait();
      return receipt;
    } catch (err) {
      console.error('Error aprobando tokens:', err);
      throw err;
    }
  };

  // Comprar con cashback
  const purchaseWithCashback = async (merchantAddress, amount) => {
    if (!contracts.loyalty || !contracts.felicoin) {
      throw new Error('Contratos no inicializados');
    }

    try {
      // Obtener dirección del contrato loyalty
      const loyaltyAddress = await contracts.loyalty.getAddress();

      // Primero aprobar tokens
      const amountWei = ethers.parseEther(amount.toString());
      const approveTx = await contracts.felicoin.approve(loyaltyAddress, amountWei);
      await approveTx.wait();

      // Luego procesar compra
      const tx = await contracts.loyalty.processPurchase(merchantAddress, amountWei);
      const receipt = await tx.wait();

      // Actualizar balances
      await updateBalances(account, contracts);

      return receipt;
    } catch (err) {
      console.error('Error procesando compra:', err);
      throw err;
    }
  };

  // Comprar ticket NFT
  const buyTicket = async (eventId) => {
    if (!contracts.eventTicket) {
      throw new Error('Contrato EventTicket no inicializado');
    }

    try {
      const tx = await contracts.eventTicket.mintTicket(eventId);
      const receipt = await tx.wait();

      // Actualizar balances
      await updateBalances(account, contracts);

      return receipt;
    } catch (err) {
      console.error('Error comprando ticket:', err);
      throw err;
    }
  };

  // Hacer staking
  const stakeTokens = async (amount) => {
    if (!contracts.staking || !contracts.felicoin) {
      throw new Error('Contratos no inicializados');
    }

    try {
      console.log('🔄 Iniciando staking de', amount, 'FELICOINS...');

      // Obtener dirección del contrato de staking
      const stakingAddress = await contracts.staking.getAddress();
      console.log('📍 Dirección contrato Staking:', stakingAddress);

      // Aprobar tokens para staking
      const amountWei = ethers.parseEther(amount.toString());
      console.log('✅ Aprobando tokens...');
      const approveTx = await contracts.felicoin.approve(stakingAddress, amountWei);
      await approveTx.wait();
      console.log('✅ Tokens aprobados');

      // Hacer stake
      console.log('💰 Haciendo stake...');
      const tx = await contracts.staking.stake(amountWei);
      const receipt = await tx.wait();
      console.log('✅ Stake exitoso! TX:', receipt.hash);

      // Actualizar balances
      await updateBalances(account, contracts);

      return receipt;
    } catch (err) {
      console.error('❌ Error haciendo staking:', err);
      throw err;
    }
  };

  // Retirar staking
  const withdrawStaking = async (amount) => {
    if (!contracts.staking) {
      throw new Error('Contrato Staking no inicializado');
    }

    try {
      const amountWei = ethers.parseEther(amount.toString());
      const tx = await contracts.staking.withdraw(amountWei);
      const receipt = await tx.wait();

      // Actualizar balances
      await updateBalances(account, contracts);

      return receipt;
    } catch (err) {
      console.error('Error retirando staking:', err);
      throw err;
    }
  };

  // Reclamar recompensas
  const claimRewards = async () => {
    if (!contracts.staking) {
      throw new Error('Contrato Staking no inicializado');
    }

    try {
      const tx = await contracts.staking.claimRewards();
      const receipt = await tx.wait();

      // Actualizar balances
      await updateBalances(account, contracts);

      return receipt;
    } catch (err) {
      console.error('Error reclamando recompensas:', err);
      throw err;
    }
  };

  // Obtener información de staking
  const getStakingInfo = async () => {
    if (!contracts?.staking || !account) {
      return {
        amount: '0',
        stakedAt: null,
        lastClaimAt: null,
        pendingRewards: '0'
      };
    }

    try {
      console.log('📊 Obteniendo info de staking para:', account);

      // Llamar al contrato
      const result = await contracts.staking.getStakeInfo(account);

      console.log('📦 Resultado del contrato:', result);

      // El contrato devuelve una tupla: [amount, stakedAt, lastClaimAt, pendingRewards]
      // Extraer valores de manera segura
      let amount = '0';
      let stakedAt = null;
      let lastClaimAt = null;
      let pendingRewards = '0';

      try {
        // Convertir Result a array para verificar longitud
        const resultLength = result.length || 0;
        console.log('📏 Longitud del resultado:', resultLength);

        // amount (índice 0)
        if (resultLength > 0 && result[0] !== undefined && result[0] !== null) {
          amount = ethers.formatEther(result[0]);
        }

        // stakedAt (índice 1) - timestamp en segundos
        if (resultLength > 1 && result[1] !== undefined && result[1] !== null) {
          const timestamp = Number(result[1]);
          if (timestamp > 0 && timestamp < 253402300799) { // Antes del año 9999
            stakedAt = new Date(timestamp * 1000);
          }
        }

        // lastClaimAt (índice 2) - timestamp en segundos
        if (resultLength > 2 && result[2] !== undefined && result[2] !== null) {
          const timestamp = Number(result[2]);
          if (timestamp > 0 && timestamp < 253402300799) {
            lastClaimAt = new Date(timestamp * 1000);
          }
        }

        // pendingRewards (índice 3) - solo si existe
        if (resultLength > 3 && result[3] !== undefined && result[3] !== null) {
          pendingRewards = ethers.formatEther(result[3]);
        } else {
          // Si no hay índice 3, calcular pendingRewards manualmente
          console.log('⚠️ El contrato no devuelve pendingRewards, calculando...');
          try {
            const calculatedRewards = await contracts.staking.calculateRewards(account);
            if (calculatedRewards !== undefined && calculatedRewards !== null) {
              pendingRewards = ethers.formatEther(calculatedRewards);
              console.log('💰 Pending rewards calculado:', pendingRewards);
            }
          } catch (calcError) {
            console.warn('⚠️ No se pudo calcular pending rewards:', calcError.message);
            pendingRewards = '0';
          }
        }
      } catch (parseError) {
        console.error('⚠️ Error parseando valores:', parseError);
      }

      const stakingInfo = {
        amount,
        stakedAt,
        lastClaimAt,
        pendingRewards
      };

      console.log('✅ Info de staking procesada:', stakingInfo);

      return stakingInfo;

    } catch (err) {
      console.error('❌ Error obteniendo info de staking:', err);
      // Retornar valores por defecto en lugar de null
      return {
        amount: '0',
        stakedAt: null,
        lastClaimAt: null,
        pendingRewards: '0'
      };
    }
  };

  // Escuchar eventos de MetaMask
  useEffect(() => {
    if (!isMetaMaskInstalled()) return;

    const handleAccountsChanged = (accounts) => {
      if (accounts.length === 0) {
        disconnectWallet();
      } else if (accounts[0] !== account) {
        setAccount(accounts[0]);
        updateBalances(accounts[0], contracts);
      }
    };

    const handleChainChanged = (chainId) => {
      setChainId(chainId);
      // Recargar página cuando cambia la red
      window.location.reload();
    };

    window.ethereum.on('accountsChanged', handleAccountsChanged);
    window.ethereum.on('chainChanged', handleChainChanged);

    return () => {
      if (window.ethereum.removeListener) {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
        window.ethereum.removeListener('chainChanged', handleChainChanged);
      }
    };
  }, [account, contracts]);

  // Intentar reconectar automáticamente
  useEffect(() => {
    if (isMetaMaskInstalled() && !account) {
      // Verificar si ya hay cuentas conectadas
      window.ethereum.request({ method: 'eth_accounts' })
        .then(accounts => {
          if (accounts.length > 0) {
            connectWallet();
          }
        })
        .catch(console.error);
    }
  }, []);

  const value = {
    // Estado
    account,
    provider,
    signer,
    contracts,
    balance,
    feliBalance,
    isConnecting,
    error,
    chainId,
    isConnected: !!account,
    isMetaMaskInstalled: isMetaMaskInstalled(),

    // Métodos
    connectWallet,
    disconnectWallet,
    getFeliBalance,
    approveTokens,
    purchaseWithCashback,
    buyTicket,
    stakeTokens,
    withdrawStaking,
    claimRewards,
    getStakingInfo,
    updateBalances: () => updateBalances(account, contracts)
  };

  return <Web3Context.Provider value={value}>{children}</Web3Context.Provider>;
};

export default Web3Provider;

