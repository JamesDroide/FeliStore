// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "./IdentityRegistry.sol";

/**
 * @title EventTicket
 * @dev NFT tickets para eventos exclusivos de Felistore
 * Los tickets se compran con tokens Felicoins
 */
contract EventTicket is ERC721, ERC721URIStorage, ERC721Enumerable, Ownable {
    IERC20 public felicoinToken;
    IdentityRegistry public identityRegistry;

    uint256 private _nextTokenId = 1;

    struct Event {
        string name;
        uint256 ticketPrice;
        uint256 maxTickets;
        uint256 ticketsSold;
        uint256 eventDate;
        bool isActive;
        bool requiresVerification;
        string metadataURI;
    }

    mapping(uint256 => Event) public events;
    mapping(uint256 => uint256) public ticketToEvent; // tokenId => eventId

    uint256 public nextEventId = 1;
    address public treasury;

    event EventCreated(
        uint256 indexed eventId,
        string name,
        uint256 ticketPrice,
        uint256 maxTickets,
        uint256 eventDate
    );

    event TicketPurchased(
        uint256 indexed tokenId,
        uint256 indexed eventId,
        address indexed buyer,
        uint256 price,
        uint256 timestamp
    );

    event EventStatusChanged(uint256 indexed eventId, bool isActive);

    constructor(
        address _felicoinToken,
        address _identityRegistry,
        address _treasury
    ) ERC721("Felistore Event Ticket", "FET") Ownable(msg.sender) {
        require(_felicoinToken != address(0), "Invalid token address");
        require(_identityRegistry != address(0), "Invalid registry address");
        require(_treasury != address(0), "Invalid treasury address");

        felicoinToken = IERC20(_felicoinToken);
        identityRegistry = IdentityRegistry(_identityRegistry);
        treasury = _treasury;
    }

    /**
     * @dev Crea un nuevo evento
     */
    function createEvent(
        string memory name,
        uint256 ticketPrice,
        uint256 maxTickets,
        uint256 eventDate,
        bool requiresVerification,
        string memory metadataURI
    ) external onlyOwner returns (uint256) {
        require(bytes(name).length > 0, "Name cannot be empty");
        require(maxTickets > 0, "Max tickets must be > 0");
        require(eventDate > block.timestamp, "Event date must be in future");

        uint256 eventId = nextEventId++;

        events[eventId] = Event({
            name: name,
            ticketPrice: ticketPrice,
            maxTickets: maxTickets,
            ticketsSold: 0,
            eventDate: eventDate,
            isActive: true,
            requiresVerification: requiresVerification,
            metadataURI: metadataURI
        });

        emit EventCreated(eventId, name, ticketPrice, maxTickets, eventDate);

        return eventId;
    }

    /**
     * @dev Compra un ticket para un evento
     * @param eventId ID del evento
     */
    function buyTicket(uint256 eventId) external returns (uint256) {
        Event storage eventInfo = events[eventId];
        address buyer = msg.sender;

        require(eventInfo.isActive, "Event not active");
        require(eventInfo.ticketsSold < eventInfo.maxTickets, "Sold out");
        require(eventInfo.eventDate > block.timestamp, "Event has passed");

        // Verificar identidad si es requerido
        if (eventInfo.requiresVerification) {
            require(
                identityRegistry.isVerified(buyer),
                "Identity verification required"
            );
        }

        // Transferir FELI del comprador a la tesorería
        if (eventInfo.ticketPrice > 0) {
            require(
                felicoinToken.transferFrom(buyer, treasury, eventInfo.ticketPrice),
                "Payment failed"
            );
        }

        // Acuñar NFT ticket
        uint256 tokenId = _nextTokenId++;
        _safeMint(buyer, tokenId);

        // Establecer metadata del ticket
        if (bytes(eventInfo.metadataURI).length > 0) {
            _setTokenURI(tokenId, eventInfo.metadataURI);
        }

        ticketToEvent[tokenId] = eventId;
        eventInfo.ticketsSold++;

        emit TicketPurchased(tokenId, eventId, buyer, eventInfo.ticketPrice, block.timestamp);

        return tokenId;
    }

    /**
     * @dev Activa o desactiva un evento
     */
    function setEventStatus(uint256 eventId, bool isActive) external onlyOwner {
        require(events[eventId].maxTickets > 0, "Event does not exist");
        events[eventId].isActive = isActive;
        emit EventStatusChanged(eventId, isActive);
    }

    /**
     * @dev Actualiza la dirección de la tesorería
     */
    function updateTreasury(address newTreasury) external onlyOwner {
        require(newTreasury != address(0), "Invalid treasury address");
        treasury = newTreasury;
    }

    /**
     * @dev Obtiene información de un evento
     */
    function getEvent(uint256 eventId)
        external
        view
        returns (
            string memory name,
            uint256 ticketPrice,
            uint256 maxTickets,
            uint256 ticketsSold,
            uint256 eventDate,
            bool isActive,
            bool requiresVerification
        )
    {
        Event memory eventInfo = events[eventId];
        return (
            eventInfo.name,
            eventInfo.ticketPrice,
            eventInfo.maxTickets,
            eventInfo.ticketsSold,
            eventInfo.eventDate,
            eventInfo.isActive,
            eventInfo.requiresVerification
        );
    }

    /**
     * @dev Verifica si una dirección tiene un ticket para un evento específico
     */
    function hasTicketForEvent(address user, uint256 eventId)
        external
        view
        returns (bool)
    {
        uint256 balance = balanceOf(user);

        for (uint256 i = 0; i < balance; i++) {
            uint256 tokenId = tokenOfOwnerByIndex(user, i);
            if (ticketToEvent[tokenId] == eventId) {
                return true;
            }
        }

        return false;
    }

    // Override requeridos por Solidity
    function _update(address to, uint256 tokenId, address auth)
        internal
        override(ERC721, ERC721Enumerable)
        returns (address)
    {
        return super._update(to, tokenId, auth);
    }

    function _increaseBalance(address account, uint128 value)
        internal
        override(ERC721, ERC721Enumerable)
    {
        super._increaseBalance(account, value);
    }

    function tokenURI(uint256 tokenId)
        public
        view
        override(ERC721, ERC721URIStorage)
        returns (string memory)
    {
        return super.tokenURI(tokenId);
    }

    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721, ERC721URIStorage, ERC721Enumerable)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}

