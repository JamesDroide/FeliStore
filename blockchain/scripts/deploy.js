const hre = require("hardhat");

async function main() {
  const initialSupply = hre.ethers.parseUnits("1000000", 18);

  const Felicoin = await hre.ethers.getContractFactory("Felicoin");
  const felicoin = await Felicoin.deploy(initialSupply);

  await felicoin.waitForDeployment();

  console.log(`Felicoin deployed to: ${await felicoin.getAddress()}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
