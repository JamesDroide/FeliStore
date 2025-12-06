# ESPECIFICACIÓN TÉCNICA: BLOCKCHAIN (SMART CONTRACTS)

## Stack Tecnológico
- Solidity ^0.8.20
- OpenZeppelin Contracts (ERC20, ERC721, AccessControl, Governor)

## 1. Módulo Principal (Pagos y Lealtad)
### `FelicoinToken.sol` (ERC-20)
- **Símbolo:** FELI
- **Rol:** Moneda principal para pagos y recompensas.
- **Características:** Minteable (por el contrato de Lealtad), Quemable (para eventos).

### `LoyaltyPayment.sol`
- **Función:** `processPurchase(address merchant, uint256 amount)`
- **Lógica:** Transfiere FELI del Usuario al Comercio -> Acuña (Mints) un % de Cashback al Usuario.
- **Evento:** `PurchaseProcessed(buyer, merchant, amount, reward)`

## 2. Módulo de Identidad (Credenciales Digitales)
### `IdentityRegistry.sol`
- **Propósito:** Registro en cadena (on-chain) de usuarios verificados.
- **Mapping:** `mapping(address => bool) isVerified;`
- **Función:** `registerIdentity(address user, bytes32 documentHash)` (Solo Admin).
- **Beneficio:** Requisito para participar en la DAO o comprar tickets VIP.

## 3. Módulo de Gobernanza y Staking (DAO)
### `FelicoinStaking.sol`
- **Propósito:** Los usuarios bloquean FELI para ganar intereses.
- **Funciones:** `stake(uint256 amount)`, `withdraw()`, `claimRewards()`.
- **Eventos:** `Staked(user, amount)`, `Withdrawn(user, amount)`.

### `FelicoinGovernor.sol` (DAO)
- **Propósito:** Sistema de votación.
- **Base:** OpenZeppelin GovernorCompatibilityBravo.
- **Lógica:** 1 Token = 1 Voto. Se usa para cambiar tasas de cashback o aprobar nuevos comercios.

## 4. Módulo de Eventos (NFTs)
### `EventTicket.sol` (ERC-721)
- **Propósito:** Tickets NFT para eventos exclusivos.
- **Función:** `buyTicket(uint256 eventId)`
- **Costo:** Cuesta tokens FELI (se queman o se envían a la tesorería).
- **Metadatos:** El ticket almacena la URI con Fecha/Ubicación del evento.

## Orden de Despliegue (Deploy)
1. Desplegar `FelicoinToken`.
2. Desplegar `IdentityRegistry`.
3. Desplegar `LoyaltyPayment` (Otorgar MINTER_ROLE en FelicoinToken).
4. Desplegar `EventTicket` (Configurar token de pago como FelicoinToken).
5. Desplegar `FelicoinStaking` y `FelicoinGovernor`.