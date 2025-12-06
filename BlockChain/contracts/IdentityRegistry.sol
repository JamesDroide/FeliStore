// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/access/AccessControl.sol";

/**
 * @title IdentityRegistry
 * @dev Registro de identidades verificadas on-chain
 * Permite a usuarios verificados participar en DAO y comprar tickets VIP
 */
contract IdentityRegistry is AccessControl {
    bytes32 public constant VERIFIER_ROLE = keccak256("VERIFIER_ROLE");

    struct Identity {
        bool isVerified;
        bytes32 documentHash;
        uint256 verifiedAt;
        address verifiedBy;
    }

    // Mapping de identidades verificadas
    mapping(address => Identity) public identities;

    // Contador de identidades verificadas
    uint256 public totalVerified;

    event IdentityRegistered(
        address indexed user,
        bytes32 documentHash,
        address indexed verifier,
        uint256 timestamp
    );

    event IdentityRevoked(
        address indexed user,
        address indexed revokedBy,
        uint256 timestamp
    );

    constructor() {
        // El deployer recibe ambos roles
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(VERIFIER_ROLE, msg.sender);
    }

    /**
     * @dev Registra una identidad verificada
     * @param user Dirección del usuario a verificar
     * @param documentHash Hash del documento de identidad
     */
    function registerIdentity(address user, bytes32 documentHash)
        external
        onlyRole(VERIFIER_ROLE)
    {
        require(user != address(0), "Invalid user address");
        require(!identities[user].isVerified, "User already verified");
        require(documentHash != bytes32(0), "Invalid document hash");

        identities[user] = Identity({
            isVerified: true,
            documentHash: documentHash,
            verifiedAt: block.timestamp,
            verifiedBy: msg.sender
        });

        totalVerified++;

        emit IdentityRegistered(user, documentHash, msg.sender, block.timestamp);
    }

    /**
     * @dev Revoca una identidad verificada
     * @param user Dirección del usuario a revocar
     */
    function revokeIdentity(address user)
        external
        onlyRole(VERIFIER_ROLE)
    {
        require(identities[user].isVerified, "User not verified");

        delete identities[user];
        totalVerified--;

        emit IdentityRevoked(user, msg.sender, block.timestamp);
    }

    /**
     * @dev Verifica si un usuario está verificado
     * @param user Dirección del usuario
     */
    function isVerified(address user) external view returns (bool) {
        return identities[user].isVerified;
    }

    /**
     * @dev Obtiene la información de identidad de un usuario
     * @param user Dirección del usuario
     */
    function getIdentity(address user)
        external
        view
        returns (
            bool verified,
            bytes32 documentHash,
            uint256 verifiedAt,
            address verifiedBy
        )
    {
        Identity memory identity = identities[user];
        return (
            identity.isVerified,
            identity.documentHash,
            identity.verifiedAt,
            identity.verifiedBy
        );
    }
}

