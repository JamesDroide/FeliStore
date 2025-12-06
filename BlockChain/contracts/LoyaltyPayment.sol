// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "./FelicoinToken.sol";

/**
 * @title LoyaltyPayment
 * @dev Sistema de pagos con cashback automático en FELI
 * Procesa compras y recompensa a los usuarios con un % de cashback
 */
contract LoyaltyPayment is Ownable {
    FelicoinToken public felicoinToken;

    // Porcentaje de cashback (en basis points: 500 = 5%)
    uint256 public cashbackRate = 500; // 5% por defecto
    uint256 public constant BASIS_POINTS = 10000;

    // Mapping de comercios autorizados
    mapping(address => bool) public authorizedMerchants;

    // Estadísticas
    uint256 public totalPurchases;
    uint256 public totalCashbackDistributed;

    event PurchaseProcessed(
        address indexed buyer,
        address indexed merchant,
        uint256 amount,
        uint256 reward,
        uint256 timestamp
    );

    event MerchantAuthorized(address indexed merchant, bool authorized);
    event CashbackRateUpdated(uint256 oldRate, uint256 newRate);

    constructor(address _felicoinToken) Ownable(msg.sender) {
        require(_felicoinToken != address(0), "Invalid token address");
        felicoinToken = FelicoinToken(_felicoinToken);
    }

    /**
     * @dev Procesa una compra y distribuye cashback
     * @param merchant Dirección del comercio que recibe el pago
     * @param amount Cantidad de FELI a pagar
     */
    function processPurchase(address merchant, uint256 amount) external {
        require(authorizedMerchants[merchant], "Merchant not authorized");
        require(amount > 0, "Amount must be greater than 0");

        address buyer = msg.sender;

        // Calcular cashback
        uint256 cashbackAmount = (amount * cashbackRate) / BASIS_POINTS;

        // Transferir tokens del comprador al comercio
        require(
            felicoinToken.transferFrom(buyer, merchant, amount),
            "Transfer to merchant failed"
        );

        // Acuñar tokens de cashback para el comprador
        if (cashbackAmount > 0) {
            felicoinToken.mint(buyer, cashbackAmount);
            totalCashbackDistributed += cashbackAmount;
        }

        totalPurchases++;

        emit PurchaseProcessed(buyer, merchant, amount, cashbackAmount, block.timestamp);
    }

    /**
     * @dev Autoriza o desautoriza un comercio
     * @param merchant Dirección del comercio
     * @param authorized Estado de autorización
     */
    function setMerchantAuthorization(address merchant, bool authorized) external onlyOwner {
        require(merchant != address(0), "Invalid merchant address");
        authorizedMerchants[merchant] = authorized;
        emit MerchantAuthorized(merchant, authorized);
    }

    /**
     * @dev Actualiza la tasa de cashback
     * @param newRate Nueva tasa en basis points (500 = 5%)
     */
    function updateCashbackRate(uint256 newRate) external onlyOwner {
        require(newRate <= 2000, "Cashback rate too high"); // Máximo 20%
        uint256 oldRate = cashbackRate;
        cashbackRate = newRate;
        emit CashbackRateUpdated(oldRate, newRate);
    }

    /**
     * @dev Verifica si una dirección es un comercio autorizado
     */
    function isMerchantAuthorized(address merchant) external view returns (bool) {
        return authorizedMerchants[merchant];
    }
}

