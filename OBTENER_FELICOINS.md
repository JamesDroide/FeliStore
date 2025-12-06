# 💰 OBTENER FELICOINS PARA PROBAR

## ✅ Ya conectaste tu wallet, ahora necesitas FELICOINS

---

## 🎯 MÉTODO RÁPIDO: Mint desde el script

### **Ejecuta este comando:**

```powershell
cd BlockChain
npm run mint 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266
```

**Reemplaza** `0xf39Fd...2266` con **tu dirección de wallet** (la que aparece en el dropdown de Felistore)

---

## 📋 PASOS DETALLADOS:

### **1. Copia tu dirección de wallet**

En Felistore, en el dropdown del wallet (arriba a la derecha), verás algo como:
```
0xbea4...6e2d
```

Copia la **dirección completa** desde MetaMask:
- MetaMask → Click en tu cuenta → Dirección aparece arriba
- Ejemplo: `0xbea46c6d7a3b5c548ef583416894e5f78ee26e2d`

### **2. Ejecuta el script de mint**

```powershell
# Abre una terminal en la carpeta BlockChain
cd C:\Users\james\OneDrive\Documentos\PREGRADO UPAO\CICLO 10\Block Chain\FeliStore\BlockChain

# Ejecuta el script con TU dirección
npm run mint TU_DIRECCION_AQUI

# Ejemplo:
npm run mint 0xbea46c6d7a3b5c548ef583416894e5f78ee26e2d
```

### **3. Espera la confirmación**

Verás algo como:
```
🪙 Iniciando mint de FELICOINS...

📝 Cuenta deployer: 0xf39F...2266
🪙 Contrato FelicoinToken: 0x5FbD...0aa3

💸 Enviando 10,000 FELICOINS a: 0xbea4...6e2d
⏳ Esperando confirmación...

✅ Transacción exitosa!
📜 Hash: 0x1234...abcd

🎉 BALANCE ACTUALIZADO:
💰 10,000 FELICOINS

✨ Ahora puedes comprar en Felistore!
```

### **4. Refresca Felistore**

- Ve a tu navegador
- Refresca la página (F5)
- ¡Deberías ver **10,000 FELICOINS** en tu wallet! 🎉

---

## 🔄 SI NECESITAS MÁS TOKENS:

Simplemente ejecuta el script de nuevo:
```powershell
npm run mint TU_DIRECCION
```

Cada vez te dará **10,000 FELICOINS** adicionales.

---

## 🎮 AHORA PUEDES:

- ✅ **Comprar productos** (cuesta FELICOINS)
- ✅ **Hacer staking** (invierte FELICOINS)
- ✅ **Recibir cashback** (+450 FELICOINS disponibles)
- ✅ **Transferir tokens** a otras cuentas

---

## 💡 ALTERNATIVA: Desde el frontend

También puedes obtener tokens haciendo click en **"Recibir"** en el dropdown del wallet, pero el método del script es más rápido y directo.

---

## 🚨 TROUBLESHOOTING

### **Error: "Cannot find module"**
```powershell
# Instala las dependencias primero
cd BlockChain
npm install
```

### **Error: "Contract not deployed"**
```powershell
# Despliega los contratos primero
npm run deploy:local
```

### **No se actualiza el balance**
- Refresca la página (F5)
- Verifica que estés en la red "Hardhat Local" en MetaMask
- Verifica que usaste tu dirección correcta

---

## ✅ CHECKLIST:

- [ ] Nodo de Hardhat corriendo
- [ ] Contratos desplegados
- [ ] Wallet conectada en Felistore
- [ ] Dirección de wallet copiada
- [ ] Script de mint ejecutado
- [ ] Balance actualizado a 10,000 FELICOINS
- [ ] ¡Listo para comprar! 🛒

---

**¡Ahora sí puedes probar todas las funcionalidades de Felistore!** 🚀✨

