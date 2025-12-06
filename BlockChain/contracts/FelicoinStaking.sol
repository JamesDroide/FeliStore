// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title FelicoinStaking
 * @dev Sistema de staking para ganar recompensas bloqueando FELI
 */
contract FelicoinStaking is ReentrancyGuard, Ownable {
    IERC20 public felicoinToken;

    // Tasa de recompensa anual (en basis points: 1000 = 10% APY)
    uint256 public rewardRate = 1000; // 10% APY por defecto
    uint256 public constant BASIS_POINTS = 10000;
    uint256 public constant SECONDS_PER_YEAR = 365 days;

    struct StakeInfo {
        uint256 amount;
        uint256 stakedAt;
        uint256 lastClaimAt;
    }

    mapping(address => StakeInfo) public stakes;

    uint256 public totalStaked;
    uint256 public totalRewardsPaid;

    event Staked(address indexed user, uint256 amount, uint256 timestamp);
    event Withdrawn(address indexed user, uint256 amount, uint256 timestamp);
    event RewardsClaimed(address indexed user, uint256 amount, uint256 timestamp);
    event RewardRateUpdated(uint256 oldRate, uint256 newRate);

    constructor(address _felicoinToken) Ownable(msg.sender) {
        require(_felicoinToken != address(0), "Invalid token address");
        felicoinToken = IERC20(_felicoinToken);
    }

    /**
     * @dev Deposita tokens FELI para hacer staking
     * @param amount Cantidad de tokens a depositar
     */
    function stake(uint256 amount) external nonReentrant {
        require(amount > 0, "Cannot stake 0 tokens");

        address user = msg.sender;

        // Si ya tiene stake, primero reclamar recompensas pendientes
        if (stakes[user].amount > 0) {
            _claimRewards(user);
        }

        // Transferir tokens del usuario al contrato
        require(
            felicoinToken.transferFrom(user, address(this), amount),
            "Transfer failed"
        );

        // Actualizar información de stake
        stakes[user].amount += amount;
        stakes[user].stakedAt = block.timestamp;
        stakes[user].lastClaimAt = block.timestamp;

        totalStaked += amount;

        emit Staked(user, amount, block.timestamp);
    }

    /**
     * @dev Retira tokens FELI del staking
     * @param amount Cantidad de tokens a retirar
     */
    function withdraw(uint256 amount) external nonReentrant {
        address user = msg.sender;
        require(amount > 0, "Cannot withdraw 0 tokens");
        require(stakes[user].amount >= amount, "Insufficient staked amount");

        // Reclamar recompensas pendientes antes de retirar
        _claimRewards(user);

        // Actualizar información de stake
        stakes[user].amount -= amount;
        totalStaked -= amount;

        // Transferir tokens de vuelta al usuario
        require(
            felicoinToken.transfer(user, amount),
            "Transfer failed"
        );

        emit Withdrawn(user, amount, block.timestamp);
    }

    /**
     * @dev Reclama las recompensas acumuladas
     */
    function claimRewards() external nonReentrant {
        _claimRewards(msg.sender);
    }

    /**
     * @dev Función interna para reclamar recompensas
     */
    function _claimRewards(address user) internal {
        uint256 rewards = calculateRewards(user);

        if (rewards > 0) {
            stakes[user].lastClaimAt = block.timestamp;
            totalRewardsPaid += rewards;

            // Transferir recompensas al usuario
            require(
                felicoinToken.transfer(user, rewards),
                "Reward transfer failed"
            );

            emit RewardsClaimed(user, rewards, block.timestamp);
        }
    }

    /**
     * @dev Calcula las recompensas pendientes de un usuario
     * @param user Dirección del usuario
     */
    function calculateRewards(address user) public view returns (uint256) {
        StakeInfo memory stakeInfo = stakes[user];

        if (stakeInfo.amount == 0) {
            return 0;
        }

        uint256 stakingDuration = block.timestamp - stakeInfo.lastClaimAt;
        uint256 rewards = (stakeInfo.amount * rewardRate * stakingDuration) /
                         (BASIS_POINTS * SECONDS_PER_YEAR);

        return rewards;
    }

    /**
     * @dev Obtiene la información de stake de un usuario
     * @param user Dirección del usuario
     */
    function getStakeInfo(address user)
        external
        view
        returns (
            uint256 amount,
            uint256 stakedAt,
            uint256 lastClaimAt,
            uint256 pendingRewards
        )
    {
        StakeInfo memory stakeInfo = stakes[user];
        return (
            stakeInfo.amount,
            stakeInfo.stakedAt,
            stakeInfo.lastClaimAt,
            calculateRewards(user)
        );
    }

    /**
     * @dev Actualiza la tasa de recompensa (solo owner)
     * @param newRate Nueva tasa en basis points
     */
    function updateRewardRate(uint256 newRate) external onlyOwner {
        require(newRate <= 5000, "Reward rate too high"); // Máximo 50% APY
        uint256 oldRate = rewardRate;
        rewardRate = newRate;
        emit RewardRateUpdated(oldRate, newRate);
    }
}

