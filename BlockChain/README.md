# 🔗 Felistore Blockchain - Smart Contracts

Sistema de Smart Contracts para Felistore, una plataforma de comercio electrónico híbrida Web2/Web3.

## 📋 Contenido

- **FelicoinToken.sol** - Token ERC-20 principal (FELI)
- **LoyaltyPayment.sol** - Sistema de pagos con cashback automático
- **IdentityRegistry.sol** - Registro de identidades verificadas on-chain
- **EventTicket.sol** - NFT tickets para eventos (ERC-721)
- **FelicoinStaking.sol** - Sistema de staking con recompensas
- **FelicoinGovernor.sol** - DAO para gobernanza comunitaria

## 🚀 Instalación

### Requisitos previos

- Node.js v20.19+ (recomendado)
- npm o yarn

### 1. Instalar dependencias

```bash
cd BlockChain
npm install
```

## 🔧 Configuración

### 1. Crear archivo .env

Copiar `.env.example` a `.env`:

```bash
cp .env.example .env
```

### 2. Configurar variables (opcional para testnet)

Para desarrollo local, no es necesario configurar las variables. Para despliegue en testnet:

```env
SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/YOUR_INFURA_KEY
PRIVATE_KEY=your_wallet_private_key_here
ETHERSCAN_API_KEY=your_etherscan_api_key
```

## 📦 Compilación

Compilar los contratos:

```bash
npm run compile
```

Esto generará los artefactos en la carpeta `artifacts/`.

## 🚀 Despliegue

### Despliegue en red local (Hardhat)

1. **Iniciar nodo local** (en una terminal separada):

```bash
npm run node
```

Esto iniciará una blockchain local en `http://127.0.0.1:8545`

2. **Desplegar contratos** (en otra terminal):

```bash
npm run deploy:local
```

### Despliegue en testnet (Sepolia)

```bash
npm run deploy:testnet
```

### Después del despliegue

El script generará automáticamente:

1. **deployments/{network}.json** - Archivo con las direcciones de los contratos
2. **BackEnd/src/config/contracts.config.js** - Configuración para el backend

## 🧪 Pruebas

Ejecutar pruebas de integración:

```bash
npm run test:integration
```

## 📖 Uso de los Contratos

### FelicoinToken (FELI)

Token ERC-20 principal con funcionalidades de minteo y quemado.

```solidity
// Obtener balance
uint256 balance = felicoin.balanceOf(address);

// Transferir tokens
felicoin.transfer(recipient, amount);

// Aprobar gasto
felicoin.approve(spender, amount);
```

### LoyaltyPayment

Sistema de pagos con cashback automático del 5%.

```solidity
// Procesar una compra (5% de cashback automático)
loyaltyPayment.processPurchase(merchantAddress, amount);
```

### IdentityRegistry

Registro de identidades verificadas.

```solidity
// Verificar si un usuario está registrado
bool isVerified = identityRegistry.isVerified(userAddress);
```

### EventTicket

Tickets NFT para eventos exclusivos.

```solidity
// Crear evento
uint256 eventId = eventTicket.createEvent(
    "Concierto Rock",
    ticketPrice,
    maxTickets,
    eventDate,
    requiresVerification,
    metadataURI
);

// Comprar ticket
uint256 tokenId = eventTicket.buyTicket(eventId);
```

### FelicoinStaking

Sistema de staking con APY del 10%.

```solidity
// Hacer staking
staking.stake(amount);

// Reclamar recompensas
staking.claimRewards();

// Retirar
staking.withdraw(amount);
```

### FelicoinGovernor

DAO para propuestas y votaciones (solo usuarios verificados pueden proponer).

```solidity
// Crear propuesta
governor.propose(targets, values, calldatas, description);

// Votar
governor.castVote(proposalId, support);
```

## 🔗 Integración con Backend

El backend escucha automáticamente los eventos de blockchain:

- **PurchaseProcessed** - Registra compras en la BD
- **TicketPurchased** - Registra tickets vendidos
- **Staked/Withdrawn** - Actualiza posiciones de staking
- **IdentityRegistered** - Sincroniza verificaciones

## 🏗️ Arquitectura

```
┌─────────────────┐
│  FelicoinToken  │ ◄── Token ERC-20 principal
└────────┬────────┘
         │
         ├──► LoyaltyPayment (mints cashback)
         ├──► EventTicket (quema/transfiere)
         ├──► FelicoinStaking (guarda tokens)
         └──► FelicoinGovernor (votación)
```

## 📊 Orden de Despliegue

Los contratos se despliegan en este orden (automatizado en `scripts/deploy.js`):

1. ✅ FelicoinToken
2. ✅ IdentityRegistry
3. ✅ LoyaltyPayment (recibe MINTER_ROLE en FelicoinToken)
4. ✅ EventTicket
5. ✅ FelicoinStaking
6. ✅ FelicoinGovernor

## 🔐 Seguridad

- Contratos basados en OpenZeppelin v5.0
- Sistema de roles (AccessControl)
- ReentrancyGuard en funciones críticas
- Rate limiting en el backend

## 🛠️ Herramientas de Desarrollo

- **Hardhat** - Framework de desarrollo
- **OpenZeppelin** - Librerías de contratos seguros
- **Ethers.js** - Interacción con Ethereum
- **Solidity 0.8.20** - Lenguaje de smart contracts

## 📝 Notas Importantes

1. **Desarrollo Local**: Los contratos se despliegan en una red temporal que se reinicia cada vez
2. **Persistencia**: Para mantener los contratos, usar `hardhat node` y desplegar en localhost
3. **Gas**: En desarrollo local el gas es gratuito
4. **Testnet**: Necesitas ETH de prueba de un faucet para desplegar en Sepolia

## 🤝 Contribuir

1. Fork el proyecto
2. Crea una rama (`git checkout -b feature/nueva-funcionalidad`)
3. Commit tus cambios (`git commit -m 'Agrega nueva funcionalidad'`)
4. Push a la rama (`git push origin feature/nueva-funcionalidad`)
5. Abre un Pull Request

## 📄 Licencia

MIT License - ver LICENSE para más detalles

## 🆘 Soporte

Para problemas o preguntas:
- Revisa la documentación de [Hardhat](https://hardhat.org/docs)
- Consulta [OpenZeppelin Docs](https://docs.openzeppelin.com/)
- Abre un issue en el repositorio

---

**Desarrollado con ❤️ por el equipo Felistore**

