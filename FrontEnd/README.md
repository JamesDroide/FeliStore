# 🛒 Felistore - Frontend Web3

Plataforma de e-commerce híbrida Web2/Web3 con integración de Blockchain Ethereum.

## 📁 Estructura del Proyecto

```
FrontEnd/
├── public/                      # Archivos estáticos
├── src/
│   ├── components/              # Componentes reutilizables
│   │   ├── layout/             # Layout (Sidebar, Header, Footer)
│   │   ├── common/             # Botones, Cards, Modals
│   │   └── web3/               # Componentes Web3 (WalletButton, etc)
│   ├── pages/                  # Páginas principales
│   │   ├── Home.js             # Dashboard principal
│   │   ├── Marketplace.js      # Tienda de productos
│   │   ├── Events.js           # Tickets NFT
│   │   ├── DAO.js              # Gobernanza y Votación
│   │   ├── Staking.js          # Panel de Staking
│   │   └── Profile.js          # Perfil e Identidad
│   ├── context/                # Context API
│   │   └── Web3Context.js      # Estado global Web3
│   ├── services/               # Servicios y APIs
│   │   ├── contractService.js  # Interacción con Smart Contracts
│   │   └── apiService.js       # Llamadas al Backend
│   ├── contracts/              # ABIs y configuración
│   │   ├── abis.js             # ABIs de contratos
│   │   └── config.js           # Direcciones de contratos
│   ├── hooks/                  # Custom Hooks
│   │   ├── useContract.js      # Hook para contratos
│   │   └── useTransaction.js   # Hook para transacciones
│   ├── utils/                  # Utilidades
│   │   ├── formatters.js       # Formateo de números/direcciones
│   │   └── validators.js       # Validaciones
│   ├── App.js                  # Componente principal
│   ├── main.js                 # Punto de entrada
│   └── index.css               # Estilos globales
├── index.html                  # HTML base
├── vite.config.js              # Configuración Vite
├── tailwind.config.js          # Configuración Tailwind
├── postcss.config.js           # Configuración PostCSS
└── package.json                # Dependencias

```

## 🚀 Instalación

```bash
# Instalar dependencias
npm install

# Modo desarrollo
npm run dev

# Build para producción
npm run build

# Preview del build
npm run preview
```

## 🔧 Tecnologías

- **React**: Framework UI
- **Vite**: Build tool ultrarrápido
- **Tailwind CSS**: Estilos utility-first
- **Ethers.js**: Librería Web3 para Ethereum
- **Lucide React**: Iconos modernos
- **Recharts**: Gráficos para visualización de datos

## 🌐 Integración Web3

### Contratos Inteligentes
- **Felicoin (ERC-20)**: Token nativo de la plataforma
- **Loyalty**: Sistema de cashback y staking
- **Identity**: Verificación de identidad descentralizada
- **Governor (DAO)**: Gobernanza comunitaria
- **Ticket (ERC-721)**: NFTs para eventos

### Context API
El `Web3Context` gestiona:
- Conexión con MetaMask
- Estado de la wallet (address, balance, network)
- Instancias de contratos
- Transacciones y eventos

## 📝 Configuración de Contratos

Actualizar direcciones en `src/contracts/config.js` después del deploy:

```javascript
export const CONTRACTS = {
  localhost: {
    FELICOIN: '0x...',
    LOYALTY: '0x...',
    // ...
  }
};
```

## 🎨 Características UI

- **Diseño Dark Mode**: Interfaz moderna en tonos oscuros
- **Responsive**: Adaptable a móviles y tablets
- **Animaciones**: Transiciones suaves
- **Feedback en tiempo real**: Loaders, toasts, confirmaciones
- **Integración MetaMask**: Conexión wallet transparente

## 🔐 Seguridad

- Validación de red (Sepolia/Localhost)
- Verificación de saldos antes de transacciones
- Manejo de errores robusto
- Confirmaciones de usuario para operaciones críticas

## 📦 Próximos Pasos

1. ✅ Estructura base creada
2. ⏳ Crear componentes de UI
3. ⏳ Implementar páginas principales
4. ⏳ Integrar con Smart Contracts
5. ⏳ Conectar con Backend (Motor de Eventos)
6. ⏳ Testing y optimización

---

**Desarrollado con ❤️ para Felistore**

