import React, { useState } from 'react';
import {
  Settings,
  Bell,
  Shield,
  Palette,
  Globe,
  Lock,
  Eye,
  EyeOff,
  Key,
  Smartphone,
  Mail,
  Save,
  AlertCircle,
  CheckCircle,
  Moon,
  Sun,
  Zap,
  Database,
  Download,
  Trash2,
  User
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.js';
import { updateUser } from '../services/api.js';
import api from '../services/api.js';
import {useWeb3} from "../context/Web3Context.js";

const SettingsView = () => {
  const { user: authUser, updateUserData } = useAuth();
  const { account, isConnected, connectWallet } = useWeb3();
  const [activeTab, setActiveTab] = useState('general'); // general, security, notifications, privacy
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);

  // Estados para cambiar contraseña
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [passwordError, setPasswordError] = useState('');

  // Estados para actualizar perfil
  const [profileData, setProfileData] = useState({
    name: authUser?.name || '',
    nickname: authUser?.nickname || ''
  });
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState(false);

  // Estados de configuración
  const [settings, setSettings] = useState({
    // General
    language: 'es',
    currency: 'USD',
    theme: 'dark',

    // Notificaciones
    emailNotifications: true,
    pushNotifications: true,
    transactionAlerts: true,
    marketingEmails: false,
    weeklyReports: true,

    // Privacidad
    publicProfile: false,
    showBalance: true,
    showActivity: false,

    // Seguridad
    twoFactorAuth: false,
    biometricAuth: false
  });

  const handleToggle = (key) => {
    setSettings(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const saveSettings = () => {
    // TODO: Guardar en backend
    alert('Configuración guardada exitosamente');
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white mb-1">Configuración</h1>
        <p className="text-slate-400">Personaliza tu experiencia en Felimarket</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar de Tabs */}
        <div className="lg:col-span-1">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-2">
            <button
              onClick={() => setActiveTab('general')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                activeTab === 'general'
                  ? 'bg-amber-500/10 text-amber-500'
                  : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <Settings size={20} />
              General
            </button>

            <button
              onClick={() => setActiveTab('security')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                activeTab === 'security'
                  ? 'bg-amber-500/10 text-amber-500'
                  : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <Shield size={20} />
              Seguridad
            </button>

            <button
              onClick={() => setActiveTab('notifications')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                activeTab === 'notifications'
                  ? 'bg-amber-500/10 text-amber-500'
                  : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <Bell size={20} />
              Notificaciones
            </button>

            <button
              onClick={() => setActiveTab('privacy')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                activeTab === 'privacy'
                  ? 'bg-amber-500/10 text-amber-500'
                  : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <Lock size={20} />
              Privacidad
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="lg:col-span-3">
          {/* GENERAL TAB */}
          {activeTab === 'general' && (
            <div className="space-y-6">
              {/* Idioma y Región */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
                <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                  <Globe className="text-amber-500" size={24} />
                  Idioma y Región
                </h3>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm text-slate-400 mb-2">Idioma</label>
                    <select
                      value={settings.language}
                      onChange={(e) => setSettings({...settings, language: e.target.value})}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-amber-500/50"
                    >
                      <option value="es">Español</option>
                      <option value="en">English</option>
                      <option value="pt">Português</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm text-slate-400 mb-2">Moneda</label>
                    <select
                      value={settings.currency}
                      onChange={(e) => setSettings({...settings, currency: e.target.value})}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-amber-500/50"
                    >
                      <option value="USD">USD - Dólar</option>
                      <option value="EUR">EUR - Euro</option>
                      <option value="PEN">PEN - Sol</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Apariencia */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
                <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                  <Palette className="text-amber-500" size={24} />
                  Apariencia
                </h3>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm text-slate-400 mb-2">Tema</label>
                    <div className="grid grid-cols-3 gap-3">
                      <button
                        onClick={() => setSettings({...settings, theme: 'dark'})}
                        className={`p-4 rounded-xl border-2 transition-all ${
                          settings.theme === 'dark' 
                            ? 'border-amber-500 bg-slate-950' 
                            : 'border-slate-800 bg-slate-950 hover:border-slate-700'
                        }`}
                      >
                        <Moon className="mx-auto text-white mb-2" size={24} />
                        <p className="text-sm font-medium text-white">Oscuro</p>
                      </button>

                      <button
                        onClick={() => setSettings({...settings, theme: 'light'})}
                        className={`p-4 rounded-xl border-2 transition-all ${
                          settings.theme === 'light' 
                            ? 'border-amber-500 bg-white' 
                            : 'border-slate-800 bg-slate-950 hover:border-slate-700'
                        }`}
                      >
                        <Sun className="mx-auto text-white mb-2" size={24} />
                        <p className="text-sm font-medium text-white">Claro</p>
                      </button>

                      <button
                        onClick={() => setSettings({...settings, theme: 'auto'})}
                        className={`p-4 rounded-xl border-2 transition-all ${
                          settings.theme === 'auto' 
                            ? 'border-amber-500 bg-slate-950' 
                            : 'border-slate-800 bg-slate-950 hover:border-slate-700'
                        }`}
                      >
                        <Zap className="mx-auto text-white mb-2" size={24} />
                        <p className="text-sm font-medium text-white">Auto</p>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* SECURITY TAB */}
          {activeTab === 'security' && (
            <div className="space-y-6">
              {/* Actualizar Perfil */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
                <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                  <User className="text-amber-500" size={24} />
                  {authUser?.nickname ? 'Actualizar Perfil' : 'Agregar Apodo'}
                </h3>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm text-slate-400 mb-2">Nombre Completo</label>
                    <input
                      type="text"
                      placeholder="Tu nombre completo"
                      value={profileData.name}
                      onChange={(e) => setProfileData({...profileData, name: e.target.value})}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-amber-500/50"
                    />
                  </div>

                  <div>
                    <label className="block text-sm text-slate-400 mb-2">
                      Apodo
                      <span className="ml-2 text-xs text-amber-500">(Así te verás en la plataforma)</span>
                    </label>
                    <input
                      type="text"
                      placeholder="Tu apodo"
                      value={profileData.nickname}
                      onChange={(e) => setProfileData({...profileData, nickname: e.target.value})}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-amber-500/50"
                    />
                  </div>

                  <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl">
                    <div className="flex items-start gap-3">
                      <AlertCircle className="text-blue-400 shrink-0 mt-0.5" size={20} />
                      <div>
                        <p className="text-sm text-blue-400">
                          Tu apodo se mostrará en lugar de tu nombre en todo el sitio. Si no tienes apodo, se mostrará tu nombre completo.
                        </p>
                      </div>
                    </div>
                  </div>

                  {profileSuccess && (
                    <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
                      <div className="flex items-center gap-3">
                        <CheckCircle className="text-emerald-400 shrink-0" size={20} />
                        <p className="text-sm text-emerald-400 font-medium">
                          ¡Perfil actualizado exitosamente!
                        </p>
                      </div>
                    </div>
                  )}

                  <button
                    onClick={async () => {
                      if (!authUser?.id) return;

                      setProfileLoading(true);
                      setProfileSuccess(false);

                      try {
                        const result = await updateUser(authUser.id, {
                          name: profileData.name,
                          nickname: profileData.nickname
                        });

                        if (result.success) {
                          // Actualizar context con nuevos datos
                          updateUserData({
                            name: profileData.name,
                            nickname: profileData.nickname
                          });
                          setProfileSuccess(true);

                          // Ocultar mensaje de éxito después de 3 segundos
                          setTimeout(() => setProfileSuccess(false), 3000);
                        }
                      } catch (error) {
                        console.error('Error updating profile:', error);
                        alert('Error al actualizar el perfil');
                      } finally {
                        setProfileLoading(false);
                      }
                    }}
                    disabled={profileLoading}
                    className="px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-600 text-slate-900 font-bold rounded-xl hover:shadow-lg hover:shadow-amber-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {profileLoading ? 'Guardando...' : 'Guardar Cambios'}
                  </button>
                </div>
              </div>

              {/* Vincular Wallet de MetaMask */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
                <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                  <Smartphone className="text-amber-500" size={24} />
                  Wallet de Criptomonedas
                </h3>

                <div className="space-y-4">
                  <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl">
                    <div className="flex items-start gap-3">
                      <AlertCircle className="text-blue-400 shrink-0 mt-0.5" size={20} />
                      <div>
                        <p className="text-sm text-blue-400 mb-2">
                          Vincula tu wallet de MetaMask para realizar transacciones en la blockchain y acceder a todas las funcionalidades Web3.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 bg-slate-950/50 rounded-xl">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center">
                          <img
                            src="https://upload.wikimedia.org/wikipedia/commons/3/36/MetaMask_Fox.svg"
                            alt="MetaMask"
                            className="w-8 h-8"
                          />
                        </div>
                        <div>
                          <h4 className="font-bold text-white">MetaMask Wallet</h4>
                          <p className="text-xs text-slate-400">
                            {authUser?.walletAddress || account
                              ? `${(authUser?.walletAddress || account).substring(0, 6)}...${(authUser?.walletAddress || account).substring((authUser?.walletAddress || account).length - 4)}`
                              : 'No vinculada'
                            }
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={async () => {
                          try {
                            // Conectar wallet usando Web3Context
                            if (!isConnected) {
                              await connectWallet();
                            }

                            // Si ya está conectada o se acaba de conectar
                            if (account) {
                              // Actualizar en BD
                              const result = await updateUser(authUser.id, {
                                walletAddress: account
                              });

                              if (result.success) {
                                // Actualizar context
                                updateUserData({
                                  walletAddress: account
                                });
                                alert(`✅ Wallet vinculada exitosamente:\n${account.substring(0, 6)}...${account.substring(account.length - 4)}`);
                              }
                            }
                          } catch (error) {
                            console.error('Error vinculando wallet:', error);
                            if (error.code === 4001) {
                              alert('❌ Conexión rechazada por el usuario');
                            } else {
                              alert('❌ Error al vincular wallet. Por favor intenta de nuevo.');
                            }
                          }
                        }}
                        className="px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-600 text-slate-900 font-bold rounded-xl hover:shadow-lg hover:shadow-amber-500/20 transition-all text-sm"
                      >
                        {authUser?.walletAddress || account ? 'Cambiar Wallet' : 'Vincular Wallet'}
                      </button>
                    </div>

                    <div className="text-xs text-slate-500">
                      Una vez vinculada, podrás realizar compras con criptomonedas, participar en el staking y votar en propuestas de gobernanza.
                    </div>
                  </div>
                </div>
              </div>

              {/* Cambiar Contraseña */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
                <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                  <Key className="text-amber-500" size={24} />
                  Cambiar Contraseña
                </h3>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm text-slate-400 mb-2">Contraseña Actual</label>
                    <div className="relative">
                      <input
                        type={showCurrentPassword ? 'text' : 'password'}
                        value={passwordData.currentPassword}
                        onChange={(e) => setPasswordData({...passwordData, currentPassword: e.target.value})}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 pr-12 text-white focus:outline-none focus:border-amber-500/50"
                        placeholder="••••••••"
                      />
                      <button
                        type="button"
                        onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                        className="absolute right-4 top-3 text-slate-400 hover:text-white"
                      >
                        {showCurrentPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm text-slate-400 mb-2">Nueva Contraseña</label>
                    <div className="relative">
                      <input
                        type={showNewPassword ? 'text' : 'password'}
                        value={passwordData.newPassword}
                        onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 pr-12 text-white focus:outline-none focus:border-amber-500/50"
                        placeholder="••••••••"
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="absolute right-4 top-3 text-slate-400 hover:text-white"
                      >
                        {showNewPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm text-slate-400 mb-2">Confirmar Nueva Contraseña</label>
                    <div className="relative">
                      <input
                        type={showNewPassword ? 'text' : 'password'}
                        value={passwordData.confirmPassword}
                        onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 pr-12 text-white focus:outline-none focus:border-amber-500/50"
                        placeholder="••••••••"
                      />
                    </div>
                  </div>

                  {passwordError && (
                    <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-xl">
                      <div className="flex items-center gap-3">
                        <AlertCircle className="text-rose-400 shrink-0" size={20} />
                        <p className="text-sm text-rose-400">{passwordError}</p>
                      </div>
                    </div>
                  )}

                  {passwordSuccess && (
                    <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
                      <div className="flex items-center gap-3">
                        <CheckCircle className="text-emerald-400 shrink-0" size={20} />
                        <p className="text-sm text-emerald-400 font-medium">
                          ¡Contraseña actualizada exitosamente!
                        </p>
                      </div>
                    </div>
                  )}

                  <button
                    onClick={async () => {
                      // Validaciones
                      if (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
                        setPasswordError('Por favor completa todos los campos');
                        return;
                      }

                      if (passwordData.newPassword !== passwordData.confirmPassword) {
                        setPasswordError('Las contraseñas no coinciden');
                        return;
                      }

                      if (passwordData.newPassword.length < 6) {
                        setPasswordError('La contraseña debe tener al menos 6 caracteres');
                        return;
                      }

                      setPasswordLoading(true);
                      setPasswordError('');
                      setPasswordSuccess(false);

                      try {
                        const response = await api.post('/auth/change-password', {
                          userId: authUser.id,
                          currentPassword: passwordData.currentPassword,
                          newPassword: passwordData.newPassword
                        });

                        if (response.data.success) {
                          setPasswordSuccess(true);
                          setPasswordData({
                            currentPassword: '',
                            newPassword: '',
                            confirmPassword: ''
                          });
                          setTimeout(() => setPasswordSuccess(false), 3000);
                        }
                      } catch (error) {
                        console.error('Error cambiando contraseña:', error);
                        setPasswordError(error.response?.data?.error || 'Error al cambiar la contraseña');
                      } finally {
                        setPasswordLoading(false);
                      }
                    }}
                    disabled={passwordLoading}
                    className="px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-600 text-slate-900 font-bold rounded-xl hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {passwordLoading ? 'Actualizando...' : 'Actualizar Contraseña'}
                  </button>
                </div>
              </div>

              {/* Autenticación en 2 Pasos */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
                <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                  <Shield className="text-amber-500" size={24} />
                  Autenticación en 2 Pasos
                </h3>

                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-slate-950/50 rounded-xl">
                    <div className="flex items-center gap-3">
                      <Smartphone className="text-blue-400" size={24} />
                      <div>
                        <h4 className="font-bold text-white">Autenticación 2FA</h4>
                        <p className="text-sm text-slate-400">Código por SMS o App</p>
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.twoFactorAuth}
                        onChange={() => handleToggle('twoFactorAuth')}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-500"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-slate-950/50 rounded-xl">
                    <div className="flex items-center gap-3">
                      <Smartphone className="text-purple-400" size={24} />
                      <div>
                        <h4 className="font-bold text-white">Autenticación Biométrica</h4>
                        <p className="text-sm text-slate-400">Huella o Face ID</p>
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.biometricAuth}
                        onChange={() => handleToggle('biometricAuth')}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-500"></div>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* NOTIFICATIONS TAB */}
          {activeTab === 'notifications' && (
            <div className="space-y-6">
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
                <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                  <Bell className="text-amber-500" size={24} />
                  Preferencias de Notificaciones
                </h3>

                <div className="space-y-4">
                  {/* Email */}
                  <div className="flex items-center justify-between p-4 bg-slate-950/50 rounded-xl">
                    <div className="flex items-center gap-3">
                      <Mail className="text-blue-400" size={24} />
                      <div>
                        <h4 className="font-bold text-white">Notificaciones por Email</h4>
                        <p className="text-sm text-slate-400">Recibe actualizaciones por correo</p>
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.emailNotifications}
                        onChange={() => handleToggle('emailNotifications')}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-500"></div>
                    </label>
                  </div>

                  {/* Push */}
                  <div className="flex items-center justify-between p-4 bg-slate-950/50 rounded-xl">
                    <div className="flex items-center gap-3">
                      <Bell className="text-emerald-400" size={24} />
                      <div>
                        <h4 className="font-bold text-white">Notificaciones Push</h4>
                        <p className="text-sm text-slate-400">Alertas en el navegador</p>
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.pushNotifications}
                        onChange={() => handleToggle('pushNotifications')}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-500"></div>
                    </label>
                  </div>

                  {/* Transacciones */}
                  <div className="flex items-center justify-between p-4 bg-slate-950/50 rounded-xl">
                    <div className="flex items-center gap-3">
                      <Zap className="text-amber-400" size={24} />
                      <div>
                        <h4 className="font-bold text-white">Alertas de Transacciones</h4>
                        <p className="text-sm text-slate-400">Notifica cada movimiento</p>
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.transactionAlerts}
                        onChange={() => handleToggle('transactionAlerts')}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-500"></div>
                    </label>
                  </div>

                  {/* Marketing */}
                  <div className="flex items-center justify-between p-4 bg-slate-950/50 rounded-xl">
                    <div className="flex items-center gap-3">
                      <Mail className="text-purple-400" size={24} />
                      <div>
                        <h4 className="font-bold text-white">Emails de Marketing</h4>
                        <p className="text-sm text-slate-400">Ofertas y promociones</p>
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.marketingEmails}
                        onChange={() => handleToggle('marketingEmails')}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-500"></div>
                    </label>
                  </div>

                  {/* Reportes */}
                  <div className="flex items-center justify-between p-4 bg-slate-950/50 rounded-xl">
                    <div className="flex items-center gap-3">
                      <Database className="text-rose-400" size={24} />
                      <div>
                        <h4 className="font-bold text-white">Reportes Semanales</h4>
                        <p className="text-sm text-slate-400">Resumen de actividad</p>
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.weeklyReports}
                        onChange={() => handleToggle('weeklyReports')}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-500"></div>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* PRIVACY TAB */}
          {activeTab === 'privacy' && (
            <div className="space-y-6">
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
                <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                  <Lock className="text-amber-500" size={24} />
                  Configuración de Privacidad
                </h3>

                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-slate-950/50 rounded-xl">
                    <div className="flex items-center gap-3">
                      <Eye className="text-blue-400" size={24} />
                      <div>
                        <h4 className="font-bold text-white">Perfil Público</h4>
                        <p className="text-sm text-slate-400">Otros usuarios pueden ver tu perfil</p>
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.publicProfile}
                        onChange={() => handleToggle('publicProfile')}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-500"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-slate-950/50 rounded-xl">
                    <div className="flex items-center gap-3">
                      <Eye className="text-emerald-400" size={24} />
                      <div>
                        <h4 className="font-bold text-white">Mostrar Balance</h4>
                        <p className="text-sm text-slate-400">Balance visible por defecto</p>
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.showBalance}
                        onChange={() => handleToggle('showBalance')}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-500"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-slate-950/50 rounded-xl">
                    <div className="flex items-center gap-3">
                      <Database className="text-purple-400" size={24} />
                      <div>
                        <h4 className="font-bold text-white">Actividad Pública</h4>
                        <p className="text-sm text-slate-400">Muestra tus compras</p>
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.showActivity}
                        onChange={() => handleToggle('showActivity')}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-500"></div>
                    </label>
                  </div>
                </div>
              </div>

              {/* Datos y Privacidad */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
                <h3 className="text-xl font-bold text-white mb-4">Gestión de Datos</h3>
                <div className="space-y-3">
                  <button className="w-full px-4 py-3 bg-slate-950 border border-slate-800 text-white font-medium rounded-xl hover:border-slate-600 transition-colors flex items-center justify-center gap-2">
                    <Download size={18} />
                    Descargar mis Datos
                  </button>
                  <button className="w-full px-4 py-3 bg-rose-500/10 border border-rose-500/20 text-rose-400 font-medium rounded-xl hover:bg-rose-500/20 transition-colors flex items-center justify-center gap-2">
                    <Trash2 size={18} />
                    Eliminar mi Cuenta
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Botón de Guardar */}
          <div className="flex justify-end gap-4">
            <button
              onClick={saveSettings}
              className="px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-600 text-slate-900 font-bold rounded-xl hover:shadow-lg hover:shadow-amber-500/20 transition-all flex items-center gap-2"
            >
              <Save size={20} />
              Guardar Cambios
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsView;

