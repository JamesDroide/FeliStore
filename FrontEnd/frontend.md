# ESPECIFICACIÓN TÉCNICA: FRONTEND (REACT)

## Stack Tecnológico
- React + Vite + Tailwind CSS
- Ethers.js + Context API
- Recharts (para gráficos de Staking)

## Estrategia de Contexto Web3
- **Estado Global:** Almacena `userAddress`, `balanceFELI`, `isVerified`, `stakedAmount`.
- **Contratos:** Instancia los 5 contratos (Token, Loyalty, Identity, DAO, Ticket) al cargar la app.

## Módulos / Páginas

### 1. Marketplace (Inicio)
- Cuadrícula de productos.
- **Acción:** `approve()` FELI -> `processPurchase()` en el contrato de Lealtad.

### 2. Eventos (Tienda de Tickets)
- Lista de conciertos/reuniones.
- **UI:** Muestra botón "Comprar con FELI".
- **Lógica:** Verifica si el usuario tiene suficientes FELI. Llama a `EventTicket.buyTicket()`.
- **Mis Tickets:** Galería de NFTs propiedad del usuario.

### 3. DAO y Staking (Gobernanza)
- **Panel de Staking:** Input para bloquear FELI. Gráfico mostrando recompensas APY.
- **Panel de Votación:** Lista de propuestas. Botones "Votar A Favor/En Contra" conectando con `FelicoinGovernor`.

### 4. Perfil e Identidad
- **Insignia de Identidad:** Muestra "Verificado" si `isVerified` es true en la blockchain.
- **Flujo de Verificación:** Formulario para subir DNI -> API Backend -> Esperar confirmación de Blockchain.

## Requisitos UX/UI
- **Feedback:** Mostrar spinners de "Transacción Pendiente" cuando se espera a MetaMask.
- **Seguridad:** Deshabilitar botones si la Wallet no está conectada o está en la red incorrecta (Sepolia/Localhost).