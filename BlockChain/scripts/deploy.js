const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  console.log("🚀 Iniciando despliegue de contratos Felistore...\n");

  const [deployer] = await hre.ethers.getSigners();
  console.log("📝 Desplegando con la cuenta:", deployer.address);
  console.log("💰 Balance de la cuenta:", (await deployer.provider.getBalance(deployer.address)).toString());
  console.log("");

  const deployedContracts = {};

  // 1. Desplegar FelicoinToken
  console.log("1️⃣ Desplegando FelicoinToken...");
  const FelicoinToken = await hre.ethers.getContractFactory("FelicoinToken");
  const felicoinToken = await FelicoinToken.deploy();
  await felicoinToken.waitForDeployment();
  const felicoinAddress = await felicoinToken.getAddress();
  console.log("✅ FelicoinToken desplegado en:", felicoinAddress);
  deployedContracts.FelicoinToken = felicoinAddress;
  console.log("");

  // 2. Desplegar IdentityRegistry
  console.log("2️⃣ Desplegando IdentityRegistry...");
  const IdentityRegistry = await hre.ethers.getContractFactory("IdentityRegistry");
  const identityRegistry = await IdentityRegistry.deploy();
  await identityRegistry.waitForDeployment();
  const identityRegistryAddress = await identityRegistry.getAddress();
  console.log("✅ IdentityRegistry desplegado en:", identityRegistryAddress);
  deployedContracts.IdentityRegistry = identityRegistryAddress;
  console.log("");

  // 3. Desplegar LoyaltyPayment
  console.log("3️⃣ Desplegando LoyaltyPayment...");
  const LoyaltyPayment = await hre.ethers.getContractFactory("LoyaltyPayment");
  const loyaltyPayment = await LoyaltyPayment.deploy(felicoinAddress);
  await loyaltyPayment.waitForDeployment();
  const loyaltyPaymentAddress = await loyaltyPayment.getAddress();
  console.log("✅ LoyaltyPayment desplegado en:", loyaltyPaymentAddress);
  deployedContracts.LoyaltyPayment = loyaltyPaymentAddress;
  console.log("");

  // Otorgar MINTER_ROLE a LoyaltyPayment
  console.log("🔐 Otorgando MINTER_ROLE a LoyaltyPayment...");
  const MINTER_ROLE = await felicoinToken.MINTER_ROLE();
  await felicoinToken.grantRole(MINTER_ROLE, loyaltyPaymentAddress);
  console.log("✅ MINTER_ROLE otorgado");
  console.log("");

  // 4. Desplegar EventTicket
  console.log("4️⃣ Desplegando EventTicket...");
  const treasury = deployer.address; // Por ahora, el deployer es la tesorería
  const EventTicket = await hre.ethers.getContractFactory("EventTicket");
  const eventTicket = await EventTicket.deploy(
    felicoinAddress,
    identityRegistryAddress,
    treasury
  );
  await eventTicket.waitForDeployment();
  const eventTicketAddress = await eventTicket.getAddress();
  console.log("✅ EventTicket desplegado en:", eventTicketAddress);
  deployedContracts.EventTicket = eventTicketAddress;
  console.log("");

  // 5. Desplegar FelicoinStaking
  console.log("5️⃣ Desplegando FelicoinStaking...");
  const FelicoinStaking = await hre.ethers.getContractFactory("FelicoinStaking");
  const felicoinStaking = await FelicoinStaking.deploy(felicoinAddress);
  await felicoinStaking.waitForDeployment();
  const felicoinStakingAddress = await felicoinStaking.getAddress();
  console.log("✅ FelicoinStaking desplegado en:", felicoinStakingAddress);
  deployedContracts.FelicoinStaking = felicoinStakingAddress;
  console.log("");

  // 6. Desplegar FelicoinGovernor
  console.log("6️⃣ Desplegando FelicoinGovernor...");
  const FelicoinGovernor = await hre.ethers.getContractFactory("FelicoinGovernor");
  const felicoinGovernor = await FelicoinGovernor.deploy(
    felicoinAddress,
    identityRegistryAddress
  );
  await felicoinGovernor.waitForDeployment();
  const felicoinGovernorAddress = await felicoinGovernor.getAddress();
  console.log("✅ FelicoinGovernor desplegado en:", felicoinGovernorAddress);
  deployedContracts.FelicoinGovernor = felicoinGovernorAddress;
  console.log("");

  // Autorizar algunos comercios de ejemplo
  console.log("🏪 Autorizando comercios de ejemplo...");
  const merchantAddress = deployer.address; // El deployer como comercio de ejemplo
  await loyaltyPayment.setMerchantAuthorization(merchantAddress, true);
  console.log("✅ Comercio autorizado:", merchantAddress);
  console.log("");

  // Guardar direcciones de contratos
  const deploymentInfo = {
    network: hre.network.name,
    deployer: deployer.address,
    timestamp: new Date().toISOString(),
    contracts: deployedContracts,
  };

  const deploymentsDir = path.join(__dirname, "..", "deployments");
  if (!fs.existsSync(deploymentsDir)) {
    fs.mkdirSync(deploymentsDir);
  }

  const filePath = path.join(deploymentsDir, `${hre.network.name}.json`);
  fs.writeFileSync(filePath, JSON.stringify(deploymentInfo, null, 2));
  console.log("💾 Direcciones guardadas en:", filePath);
  console.log("");

  // Generar archivo de configuración para el backend
  const backendConfig = {
    FELICOIN_TOKEN_ADDRESS: felicoinAddress,
    IDENTITY_REGISTRY_ADDRESS: identityRegistryAddress,
    LOYALTY_PAYMENT_ADDRESS: loyaltyPaymentAddress,
    EVENT_TICKET_ADDRESS: eventTicketAddress,
    FELICOIN_STAKING_ADDRESS: felicoinStakingAddress,
    FELICOIN_GOVERNOR_ADDRESS: felicoinGovernorAddress,
    NETWORK: hre.network.name,
    CHAIN_ID: hre.network.config.chainId || 1337,
  };

  const backendConfigPath = path.join(__dirname, "..", "..", "BackEnd", "src", "config", "contracts.config.js");
  const backendConfigContent = `// Configuración automática de contratos desplegados
// Generado el: ${new Date().toISOString()}
// Red: ${hre.network.name}

export const contractAddresses = ${JSON.stringify(deployedContracts, null, 2)};

export const networkConfig = {
  network: "${hre.network.name}",
  chainId: ${hre.network.config.chainId || 1337},
  rpcUrl: "${hre.network.config.url || 'http://127.0.0.1:8545'}"
};

export default {
  ...contractAddresses,
  ...networkConfig
};
`;

  // Crear directorio si no existe
  const backendConfigDir = path.dirname(backendConfigPath);
  if (!fs.existsSync(backendConfigDir)) {
    fs.mkdirSync(backendConfigDir, { recursive: true });
  }

  fs.writeFileSync(backendConfigPath, backendConfigContent);
  console.log("💾 Configuración de contratos guardada para el backend");
  console.log("");

  // Resumen final
  console.log("========================================");
  console.log("✅ DESPLIEGUE COMPLETADO EXITOSAMENTE");
  console.log("========================================");
  console.log("\n📋 Direcciones de contratos:");
  console.log("----------------------------");
  Object.entries(deployedContracts).forEach(([name, address]) => {
    console.log(`${name}: ${address}`);
  });
  console.log("");
  console.log("🔗 Red:", hre.network.name);
  console.log("📦 Chain ID:", hre.network.config.chainId || 1337);
  console.log("");
  console.log("💡 Siguiente paso: Actualizar las variables de entorno en el backend con estas direcciones");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Error durante el despliegue:", error);
    process.exit(1);
  });

