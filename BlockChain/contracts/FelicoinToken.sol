// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";

/**
 * @title FelicoinToken
 * @dev Token ERC-20 principal para Felistore
 * Símbolo: FELI
 * Minteable por contratos autorizados (LoyaltyPayment)
 * Quemable para eventos y utilidades
 */
contract FelicoinToken is ERC20, ERC20Burnable, AccessControl {
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");

    // Suministro inicial: 1,000,000 FELI
    uint256 public constant INITIAL_SUPPLY = 1_000_000 * 10**18;

    event TokensMinted(address indexed to, uint256 amount);
    event TokensBurned(address indexed from, uint256 amount);

    constructor() ERC20("Felicoin", "FELI") {
        // El deployer recibe el rol de admin
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(MINTER_ROLE, msg.sender);

        // Acuñar suministro inicial al deployer
        _mint(msg.sender, INITIAL_SUPPLY);
    }

    /**
     * @dev Permite a direcciones con MINTER_ROLE acuñar nuevos tokens
     * @param to Dirección que recibirá los tokens
     * @param amount Cantidad de tokens a acuñar
     */
    function mint(address to, uint256 amount) public onlyRole(MINTER_ROLE) {
        _mint(to, amount);
        emit TokensMinted(to, amount);
    }

    /**
     * @dev Override de burn para emitir evento
     */
    function burn(uint256 amount) public override {
        super.burn(amount);
        emit TokensBurned(msg.sender, amount);
    }

    /**
     * @dev Override de burnFrom para emitir evento
     */
    function burnFrom(address account, uint256 amount) public override {
        super.burnFrom(account, amount);
        emit TokensBurned(account, amount);
    }
}

