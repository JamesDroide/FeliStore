# 🚀 Felimarket Backend API

Backend API para Felimarket - Plataforma Web3 de E-commerce con blockchain.

## 📋 Características

- ✅ API RESTful con Express.js
- ✅ Base de datos PostgreSQL con Prisma ORM
- ✅ Motor de eventos blockchain (Ethers.js)
- ✅ Listeners en tiempo real de contratos
- ✅ Gestión de productos, usuarios, propuestas y transacciones
- ✅ Verificación de identidad en blockchain
- ✅ Sistema de staking y rewards

## 🏗️ Estructura del Proyecto

```
BackEnd/
├── src/
│   ├── config/              # Configuración (DB, Blockchain)
│   │   ├── database.js      # Prisma client
│   │   └── blockchain.js    # Ethers provider y contratos
│   ├── controllers/         # Lógica de negocio
│   │   ├── products.controller.js
│   │   └── users.controller.js
│   ├── routes/              # Rutas de la API
│   │   ├── products.js
│   │   ├── users.js
│   │   ├── proposals.js
│   │   ├── identity.js
│   │   └── transactions.js
│   ├── services/            # Servicios de blockchain
│   │   ├── blockchain.service.js  # Motor de eventos
│   │   ├── identity.service.js
│   │   └── staking.service.js
│   ├── models/              # (Prisma schema)
│   ├── middleware/          # Middlewares custom
│   ├── utils/               # Utilidades
│   └── server.js            # Entry point
├── prisma/
│   └── schema.prisma        # Esquema de base de datos
├── package.json
├── .env.example
└── README.md
```

## 🚀 Instalación

### 1. Instalar dependencias

```bash
npm install
```

### 2. Configurar variables de entorno

Copia `.env.example` a `.env` y configura las variables:

```bash
cp .env.example .env
```

Edita `.env` con tus configuraciones:

```env
# Database
DATABASE_URL="postgresql://usuario:password@localhost:5432/felimarket"

# Blockchain
RPC_URL=http://127.0.0.1:8545
CHAIN_ID=31337

# Contracts (actualizar después del deploy)
CONTRACT_FELICOIN=0x...
CONTRACT_LOYALTY=0x...
CONTRACT_IDENTITY=0x...
CONTRACT_GOVERNOR=0x...
CONTRACT_TICKET=0x...

# Admin Wallet
ADMIN_PRIVATE_KEY=0x...
```

### 3. Configurar base de datos

```bash
# Generar Prisma Client
npm run prisma:generate

# Ejecutar migraciones
npm run prisma:migrate

# (Opcional) Seed de datos iniciales
npm run prisma:seed
```

### 4. Iniciar servidor

```bash
# Desarrollo (con nodemon)
npm run dev

# Producción
npm start
```

El servidor estará disponible en: `http://localhost:5000`

## 📡 Endpoints de la API

### Health Check
```
GET /health
```

### Productos
```
GET    /api/products           # Listar productos
GET    /api/products/:id       # Obtener producto
POST   /api/products           # Crear producto (admin)
PUT    /api/products/:id       # Actualizar producto (admin)
DELETE /api/products/:id       # Eliminar producto (admin)
```

### Usuarios
```
GET  /api/users/:walletAddress              # Obtener usuario
PUT  /api/users/:walletAddress              # Actualizar usuario
POST /api/users/:walletAddress/verify       # Verificar identidad
GET  /api/users/:walletAddress/verification # Estado de verificación
GET  /api/users/:walletAddress/transactions # Transacciones del usuario
```

### Propuestas (DAO)
```
GET  /api/proposals        # Listar propuestas
POST /api/proposals        # Crear propuesta
GET  /api/proposals/:id    # Obtener propuesta
```

### Transacciones
```
GET /api/transactions           # Listar transacciones
GET /api/transactions/:txHash   # Obtener transacción
```

## 🔄 Motor de Eventos Blockchain

El backend incluye un **motor de eventos** que escucha en tiempo real los siguientes contratos:

### Contratos Monitoreados:

1. **Felicoin (ERC-20)**
   - `Transfer` - Transferencias de tokens

2. **Loyalty (Staking)**
   - `Staked` - Usuario hace staking
   - `Unstaked` - Usuario retira staking
   - `CashbackEarned` - Cashback generado

3. **Identity (Verificación)**
   - `IdentityVerified` - Usuario verificado

4. **Governor (DAO)**
   - `ProposalCreated` - Nueva propuesta
   - `VoteCast` - Voto emitido

5. **Ticket (NFT Events)**
   - `TicketMinted` - Ticket NFT creado

Todos los eventos se registran automáticamente en la base de datos.

## 📊 Base de Datos

### Modelos Principales:

- **User** - Usuarios de la plataforma
- **Product** - Productos del marketplace
- **Event** - Eventos con tickets NFT
- **Proposal** - Propuestas de gobernanza
- **Transaction** - Registro de transacciones
- **Config** - Configuración del sistema

### Comandos Útiles:

```bash
# Ver base de datos con Prisma Studio
npm run prisma:studio

# Crear nueva migración
npm run prisma:migrate

# Reset de base de datos
npx prisma migrate reset
```

## 🔧 Configuración de Contratos

Después de desplegar los contratos en blockchain:

1. Actualiza las direcciones en `.env`:
```env
CONTRACT_FELICOIN=0xNuevaAddress...
CONTRACT_LOYALTY=0xNuevaAddress...
# etc.
```

2. Actualiza los ABIs en `src/config/blockchain.js` si es necesario

3. Reinicia el servidor

## 🧪 Testing

```bash
# Ejecutar tests (TODO)
npm test

# Test de conexión a blockchain
curl http://localhost:5000/health
```

## 📝 Logs

El servidor muestra logs detallados de:
- ✅ Conexión a base de datos
- ✅ Conexión a blockchain
- ✅ Eventos detectados
- ✅ Transacciones registradas
- ✅ Requests HTTP

## 🔒 Seguridad

- ✅ Helmet - HTTP headers seguros
- ✅ CORS configurado
- ✅ Rate limiting
- ✅ Validación de inputs (TODO)
- ✅ Autenticación JWT (TODO)

## 🐛 Troubleshooting

### Error: No se puede conectar a la base de datos
```bash
# Verifica que PostgreSQL esté corriendo
psql -U usuario -d felimarket

# Verifica la DATABASE_URL en .env
```

### Error: No se puede conectar a blockchain
```bash
# Verifica que el nodo esté corriendo (Hardhat/Ganache)
# Verifica el RPC_URL en .env
```

### Error: Contratos no encontrados
```bash
# Asegúrate de haber desplegado los contratos
# Actualiza las direcciones en .env
```

## 📚 Recursos

- [Express.js](https://expressjs.com/)
- [Prisma](https://www.prisma.io/)
- [Ethers.js](https://docs.ethers.org/)
- [PostgreSQL](https://www.postgresql.org/)

## 🤝 Contribución

1. Fork el proyecto
2. Crea una rama para tu feature
3. Commit tus cambios
4. Push a la rama
5. Abre un Pull Request

## 📄 Licencia

ISC

---

**🚀 Backend listo para Felimarket!**

