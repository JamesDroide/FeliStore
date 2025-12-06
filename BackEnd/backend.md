# ESPECIFICACIÓN TÉCNICA: BACKEND (NODE.JS)

## Arquitectura
- **Servidor:** Express.js
- **Base de Datos:** PostgreSQL + Prisma ORM
- **Listener Blockchain:** Ethers.js WebSocket/Polling

## Esquema de Base de Datos (Modelos Prisma)
- **User:** id, walletAddress, isVerified (Bool), role.
- **Product:** id, name, priceFELI, stock.
- **Event:** id, name, date, ticketPriceFELI, nftContractAddress.
- **Proposal:** id, title, description, status (Active/Passed), onChainId.
- **Transaction:** id, txHash, type (PURCHASE, STAKE, VOTE, MINT_TICKET).

## Servicio Blockchain (El "Motor de Eventos")
Debe escuchar a múltiples contratos simultáneamente:
1. **LoyaltyPayment:** `PurchaseProcessed` -> Registrar venta, actualizar estadísticas.
2. **EventTicket:** `Transfer` (Mint) -> Enviar email de confirmación con código QR.
3. **FelicoinStaking:** `Staked` -> Actualizar nivel de "inversor" del usuario en la BD.
4. **IdentityRegistry:** `IdentityVerified` -> Actualizar `User.isVerified = true`.

## Endpoints de la API
### Core
- `GET /api/products`: Datos del Marketplace.
- `GET /api/user/:address/history`: Historial combinado (Pagos + Staking + Votos).

### Gobernanza (DAO)
- `GET /api/proposals`: Listar propuestas activas desde la BD (sincronizadas con la cadena).
- `POST /api/proposals`: Crear borrador de propuesta (metadatos).

### Identidad
- `POST /api/identity/verify`: Recibe foto/DNI, valida (simulación IA), llama a `IdentityRegistry.registerIdentity` en la blockchain (La Wallet Admin paga el gas).