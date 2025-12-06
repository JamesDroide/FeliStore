// Script para dar FELICOINS de prueba a tu wallet
import { ethers } from 'ethers';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function mintTokens() {
    try {
        console.log('🪙 Iniciando mint de FELICOINS...\n');

        // Conectar al nodo local
        const provider = new ethers.JsonRpcProvider('http://127.0.0.1:8545');

        // Usar la cuenta deployer (tiene permisos de minter)
        const deployerPrivateKey = '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80';
        const deployer = new ethers.Wallet(deployerPrivateKey, provider);

        console.log('📝 Cuenta deployer:', deployer.address);

        // Leer direcciones de contratos
        const deploymentPath = path.join(__dirname, '../deployments/localhost.json');
        if (!fs.existsSync(deploymentPath)) {
            throw new Error('❌ No se encontró el archivo de deployment. Ejecuta primero: npm run deploy:local');
        }

        const deployment = JSON.parse(fs.readFileSync(deploymentPath, 'utf8'));
        const tokenAddress = deployment.contracts.FelicoinToken;

        console.log('🪙 Contrato FelicoinToken:', tokenAddress);

        // ABI mínimo para mint
        const tokenABI = [
            'function mint(address to, uint256 amount) external',
            'function balanceOf(address account) view returns (uint256)',
            'function decimals() view returns (uint8)'
        ];

        const tokenContract = new ethers.Contract(tokenAddress, tokenABI, deployer);

        // Dirección de tu wallet (la que acabas de conectar)
        const recipientAddress = process.argv[2] || '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266';

        // Cantidad: 10,000 FELICOINS
        const amount = ethers.parseEther('10000');

        console.log('\n💸 Enviando 10,000 FELICOINS a:', recipientAddress);
        console.log('⏳ Esperando confirmación...\n');

        const tx = await tokenContract.mint(recipientAddress, amount);
        await tx.wait();

        console.log('✅ Transacción exitosa!');
        console.log('📜 Hash:', tx.hash);

        // Verificar balance
        const balance = await tokenContract.balanceOf(recipientAddress);
        const balanceFormatted = ethers.formatEther(balance);

        console.log('\n🎉 BALANCE ACTUALIZADO:');
        console.log(`💰 ${balanceFormatted} FELICOINS`);
        console.log('\n✨ Ahora puedes comprar en Felistore!\n');

    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
}

// Ejecutar
mintTokens();

