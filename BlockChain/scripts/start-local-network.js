#!/usr/bin/env node

/**
 * Script para iniciar red local de Hardhat con configuración para Felistore
 * Ejecutar: npm run hardhat:node o node scripts/start-local-network.js
 */

const { spawn } = require('child_process');
const chalk = require('chalk');

console.log(chalk.blue.bold('\n╔════════════════════════════════════════════════════════╗'));
console.log(chalk.blue.bold('║                                                        ║'));
console.log(chalk.blue.bold('║        🚀 FELISTORE - RED LOCAL HARDHAT              ║'));
console.log(chalk.blue.bold('║                                                        ║'));
console.log(chalk.blue.bold('╚════════════════════════════════════════════════════════╝\n'));

console.log(chalk.yellow('📡 Iniciando red local de Ethereum...\n'));

// Iniciar nodo de Hardhat
const hardhatNode = spawn('npx', ['hardhat', 'node'], {
  stdio: 'inherit',
  shell: true
});

hardhatNode.on('error', (error) => {
  console.error(chalk.red('❌ Error al iniciar Hardhat:'), error);
  process.exit(1);
});

hardhatNode.on('close', (code) => {
  if (code !== 0) {
    console.log(chalk.red(`\n❌ Hardhat terminó con código: ${code}`));
  } else {
    console.log(chalk.green('\n✅ Hardhat cerrado correctamente'));
  }
});

// Mostrar instrucciones
setTimeout(() => {
  console.log(chalk.cyan('\n┌─────────────────────────────────────────────────────────┐'));
  console.log(chalk.cyan('│  📋 INSTRUCCIONES PARA CONECTAR METAMASK:              │'));
  console.log(chalk.cyan('├─────────────────────────────────────────────────────────┤'));
  console.log(chalk.white('│  1. Abre MetaMask                                       │'));
  console.log(chalk.white('│  2. Networks → Add Network → Add Manually              │'));
  console.log(chalk.white('│  3. Configura así:                                      │'));
  console.log(chalk.green('│     • Network Name: Hardhat Local                       │'));
  console.log(chalk.green('│     • RPC URL: http://127.0.0.1:8545                    │'));
  console.log(chalk.green('│     • Chain ID: 31337                                   │'));
  console.log(chalk.green('│     • Currency: ETH                                     │'));
  console.log(chalk.white('│  4. Import una cuenta con las Private Keys de arriba   │'));
  console.log(chalk.white('│  5. ¡Tendrás 10,000 ETH para probar! 💰                │'));
  console.log(chalk.cyan('└─────────────────────────────────────────────────────────┘\n'));

  console.log(chalk.magenta('🔗 SIGUIENTE PASO: Despliega los contratos'));
  console.log(chalk.white('   En otra terminal ejecuta:'));
  console.log(chalk.green('   npm run deploy:local\n'));

  console.log(chalk.gray('Para detener: Ctrl+C\n'));
}, 2000);

// Manejar Ctrl+C
process.on('SIGINT', () => {
  console.log(chalk.yellow('\n\n⏹️  Deteniendo red local...'));
  hardhatNode.kill('SIGINT');
  setTimeout(() => {
    process.exit(0);
  }, 1000);
});

