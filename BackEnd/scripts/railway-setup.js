#!/usr/bin/env node
/**
 * Script de preparación para Railway
 * Ejecuta migraciones y seed de datos
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🚀 Preparando base de datos para Railway...\n');

  try {
    // Verificar conexión
    console.log('📡 Verificando conexión a la base de datos...');
    await prisma.$connect();
    console.log('✅ Conexión exitosa\n');

    // Verificar si ya hay datos
    const userCount = await prisma.user.count();
    console.log(`📊 Usuarios existentes: ${userCount}\n`);

    if (userCount === 0) {
      console.log('🌱 No hay datos, ejecutando seed...');
      // Aquí puedes agregar datos iniciales si lo necesitas
      console.log('✅ Seed completado (vacío por ahora)\n');
    } else {
      console.log('ℹ️ La base de datos ya tiene datos\n');
    }

    console.log('✨ Base de datos lista para usar!');
  } catch (error) {
    console.error('❌ Error al preparar la base de datos:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();

