# ESTRUCTURA DEL PROYECTO: FELISTORE (Alcance Completo)

## Directorio Raíz
/felistore
│
├── /backend          # API Node.js + Escucha de Eventos Multi-Contrato
│   ├── /src
│   │   ├── /config       # Configuración de Base de Datos, Blockchain y JWT
│   │   ├── /controllers  # Lógica para Productos, Usuarios, Eventos
│   │   ├── /routes       # Endpoints de la API (Rutas)
│   │   ├── /services     # Lógica de Negocio y Listeners de Blockchain
│   │   │   ├── blockchain.service.js  # Listener Principal (Motor de Eventos)
│   │   │   ├── identity.service.js    # Lógica de Credenciales Verificables
│   │   │   └── staking.service.js     # Lógica de Staking
│   │   ├── /models       # Esquema Prisma (Tablas: Users, Tx, Tickets, Proposals)
│   │   └── app.js        # Punto de entrada del Servidor
│   ├── package.json
│   └── .env
│
├── /frontend         # Aplicación Web React (Vite)
│   ├── /src
│   │   ├── /components   # UI: Navbar, Footer, ProductCard, ProposalCard
│   │   ├── /context      # Web3Context (Estado de la Wallet y Contratos)
│   │   ├── /hooks        # Hooks Personalizados: useToken, useDAO, useIdentity
│   │   ├── /pages        # Módulos: Marketplace, Gobernanza, Staking, Eventos
│   │   └── /services     # Conectores con la API Backend
│   ├── package.json
│   └── vite.config.js
│
├── /blockchain       # Entorno Hardhat
│   ├── /contracts        # Smart Contracts en Solidity
│   │   ├── core/         # Token ERC-20 y Lógica de Lealtad
│   │   ├── identity/     # Lógica de Identidad Digital
│   │   ├── dao/          # Gobernanza y Staking
│   │   └── nfts/         # Tickets de Eventos (ERC-721)
│   ├── /scripts          # Scripts de Despliegue (Deploy)
│   └── hardhat.config.js
│
└── README.md