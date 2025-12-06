// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/governance/Governor.sol";
import "@openzeppelin/contracts/governance/extensions/GovernorSettings.sol";
import "@openzeppelin/contracts/governance/extensions/GovernorCountingSimple.sol";
import "@openzeppelin/contracts/governance/extensions/GovernorVotes.sol";
import "@openzeppelin/contracts/governance/extensions/GovernorVotesQuorumFraction.sol";
import "./IdentityRegistry.sol";

/**
 * @title FelicoinGovernor
 * @dev Sistema DAO para votaciones y gobernanza de Felistore
 * 1 Token FELI = 1 Voto
 * Solo usuarios verificados pueden crear propuestas
 */
contract FelicoinGovernor is
    Governor,
    GovernorSettings,
    GovernorCountingSimple,
    GovernorVotes,
    GovernorVotesQuorumFraction
{
    IdentityRegistry public identityRegistry;

    event ProposalCreatedByVerifiedUser(
        uint256 proposalId,
        address proposer,
        string description
    );

    constructor(
        IVotes _token,
        address _identityRegistry
    )
        Governor("Felicoin Governor")
        GovernorSettings(
            1, // 1 bloque de delay antes de que comience la votación
            50400, // ~1 semana en bloques (asumiendo 12 seg/bloque)
            0 // No hay mínimo de tokens para proponer (lo manejamos con identityRegistry)
        )
        GovernorVotes(_token)
        GovernorVotesQuorumFraction(4) // 4% de quórum requerido
    {
        require(_identityRegistry != address(0), "Invalid registry address");
        identityRegistry = IdentityRegistry(_identityRegistry);
    }

    /**
     * @dev Override para requerir verificación de identidad al crear propuestas
     */
    function propose(
        address[] memory targets,
        uint256[] memory values,
        bytes[] memory calldatas,
        string memory description
    ) public override returns (uint256) {
        require(
            identityRegistry.isVerified(msg.sender),
            "Must be verified to create proposals"
        );

        uint256 proposalId = super.propose(targets, values, calldatas, description);

        emit ProposalCreatedByVerifiedUser(proposalId, msg.sender, description);

        return proposalId;
    }

    // Funciones requeridas por overrides
    function votingDelay()
        public
        view
        override(Governor, GovernorSettings)
        returns (uint256)
    {
        return super.votingDelay();
    }

    function votingPeriod()
        public
        view
        override(Governor, GovernorSettings)
        returns (uint256)
    {
        return super.votingPeriod();
    }

    function quorum(uint256 blockNumber)
        public
        view
        override(Governor, GovernorVotesQuorumFraction)
        returns (uint256)
    {
        return super.quorum(blockNumber);
    }

    function proposalThreshold()
        public
        view
        override(Governor, GovernorSettings)
        returns (uint256)
    {
        return super.proposalThreshold();
    }
}

