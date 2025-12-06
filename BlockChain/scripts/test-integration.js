const hre = require("hardhat");

async function main() {
  console.log("🧪 Ejecutando pruebas de integración de contratos...\n");

  const [owner, user1, user2, merchant] = await hre.ethers.getSigners();

  // Obtener contratos desplegados
  const FelicoinToken = await hre.ethers.getContractFactory("FelicoinToken");
  const felicoinToken = await FelicoinToken.attach(process.env.FELICOIN_TOKEN_ADDRESS);

  const LoyaltyPayment = await hre.ethers.getContractFactory("LoyaltyPayment");
  const loyaltyPayment = await LoyaltyPayment.attach(process.env.LOYALTY_PAYMENT_ADDRESS);

  console.log("📊 Información de contratos:");
  console.log("Token:", await felicoinToken.getAddress());
  console.log("Loyalty:", await loyaltyPayment.getAddress());
  console.log("");

  // Transferir tokens a usuarios de prueba
  console.log("💸 Transfiriendo tokens a usuarios de prueba...");
  const amount = hre.ethers.parseEther("1000");
  await felicoinToken.transfer(user1.address, amount);
  await felicoinToken.transfer(user2.address, amount);
  console.log("✅ Tokens transferidos");
  console.log("");

  // Autorizar al contrato de loyalty
  console.log("🔐 Autorizando contrato de loyalty...");
  await felicoinToken.connect(user1).approve(await loyaltyPayment.getAddress(), amount);
  console.log("✅ Contrato autorizado");
  console.log("");

  // Procesar una compra
  console.log("🛒 Procesando compra de prueba...");
  const purchaseAmount = hre.ethers.parseEther("100");
  await loyaltyPayment.connect(user1).processPurchase(merchant.address, purchaseAmount);
  console.log("✅ Compra procesada");
  console.log("");

  // Verificar balances
  console.log("💰 Verificando balances:");
  const user1Balance = await felicoinToken.balanceOf(user1.address);
  const merchantBalance = await felicoinToken.balanceOf(merchant.address);
  console.log("User1:", hre.ethers.formatEther(user1Balance), "FELI");
  console.log("Merchant:", hre.ethers.formatEther(merchantBalance), "FELI");
  console.log("");

  console.log("✅ Pruebas completadas exitosamente!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Error en las pruebas:", error);
    process.exit(1);
  });

