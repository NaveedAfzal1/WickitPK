// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts@4.9.6/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts@4.9.6/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts@4.9.6/access/Ownable.sol";
import "@openzeppelin/contracts@4.9.6/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts@4.9.6/utils/Base64.sol";
import "@openzeppelin/contracts@4.9.6/utils/Strings.sol";

/// @title PSL TrustTicket — Blockchain-Powered Ticketing for Pakistan Super League 2026
/// @author PSL TrustTicket Team — ENTANGLED 2026 Hackathon
/// @notice ERC-721 NFT tickets with price-capped resale, stadium gate verification,
///         organizer royalties, and post-match digital collectibles.
/// @dev Built on OpenZeppelin v4.9.6. Deployed on WireFluid Testnet (Chain ID: 92533).
contract PSLTrustTicket is ERC721Enumerable, Ownable, ReentrancyGuard {
    using Strings for uint256;

    // ═══════════════════════════════════════════════════════════════
    //                          ENUMS
    // ═══════════════════════════════════════════════════════════════

    /// @notice Ticket tier categories matching PSL stadium sections
    enum TicketTier {
        General,  // PKR 800–1,000
        Premium,  // PKR 2,000–3,000
        VIP       // PKR 5,000–15,000
    }

    // ═══════════════════════════════════════════════════════════════
    //                         STRUCTS
    // ═══════════════════════════════════════════════════════════════

    /// @notice On-chain match metadata created by the organizer
    struct Match {
        string name;                  // e.g., "Lahore Qalandars vs Karachi Kings"
        string venue;                 // e.g., "Gaddafi Stadium, Lahore"
        uint256 date;                 // Unix timestamp of match start
        uint256 maxResalePercentage;  // e.g., 110 = max 110% of face value (10% markup)
        bool active;                  // Match exists and is valid
        bool collectible;             // Flipped post-match — tickets become souvenirs
    }

    /// @notice On-chain ticket data tied to each ERC-721 token
    struct Ticket {
        uint256 matchId;       // Which match this ticket is for
        TicketTier tier;       // General, Premium, or VIP
        uint256 faceValue;     // Original price in wei (set at mint)
        bool forSale;          // Currently listed on resale market
        uint256 listingPrice;  // Resale price in wei (0 if not listed)
        address seller;        // Seller address (for resale payout)
        bool used;             // Scanned at gate — prevents re-entry
    }

    // ═══════════════════════════════════════════════════════════════
    //                       STATE VARIABLES
    // ═══════════════════════════════════════════════════════════════

    /// @notice Auto-incrementing token ID counter (starts at 1)
    uint256 public nextTokenId = 1;

    /// @notice Auto-incrementing match ID counter (starts at 1)
    uint256 public nextMatchId = 1;

    /// @notice Royalty percentage taken by organizer on every resale (5%)
    uint256 public constant RESALE_ROYALTY_PERCENT = 5;

    /// @notice All matches indexed by match ID
    mapping(uint256 => Match) public matches;

    /// @notice All ticket metadata indexed by token ID
    mapping(uint256 => Ticket) public tickets;

    /// @notice Addresses authorized to scan tickets at stadium gates
    mapping(address => bool) public gateOperators;

    // ═══════════════════════════════════════════════════════════════
    //                          EVENTS
    // ═══════════════════════════════════════════════════════════════

    /// @notice Emitted when organizer creates a new match
    event MatchCreated(uint256 indexed matchId, string name, string venue, uint256 date);

    /// @notice Emitted for each ticket minted (batch minting emits multiple)
    event TicketMinted(uint256 indexed tokenId, uint256 indexed matchId, TicketTier tier, uint256 faceValue);

    /// @notice Emitted when a fan buys a ticket in the primary sale
    event TicketPurchased(uint256 indexed tokenId, address indexed buyer, uint256 faceValue);

    /// @notice Emitted when a ticket holder lists their ticket for resale
    event TicketListed(uint256 indexed tokenId, uint256 price, address indexed seller);

    /// @notice Emitted when a resale listing is cancelled
    event TicketListingCancelled(uint256 indexed tokenId, address indexed seller);

    /// @notice Emitted when a resale transaction completes (includes royalty amount)
    event TicketResold(
        uint256 indexed tokenId,
        address indexed buyer,
        address indexed seller,
        uint256 price,
        uint256 royalty
    );

    /// @notice Emitted when a ticket is scanned and marked used at the gate
    event TicketUsed(uint256 indexed tokenId, address indexed holder);

    /// @notice Emitted when organizer marks a match as collectible post-match
    event MatchMarkedCollectible(uint256 indexed matchId);

    /// @notice Emitted when a gate operator is added or removed
    event GateOperatorUpdated(address indexed operator, bool status);

    // ═══════════════════════════════════════════════════════════════
    //                         MODIFIERS
    // ═══════════════════════════════════════════════════════════════

    /// @notice Restricts function to gate operators or the contract owner
    modifier onlyGateOrOwner() {
        require(
            gateOperators[msg.sender] || msg.sender == owner(),
            "Not authorized: gate operator or owner only"
        );
        _;
    }

    // ═══════════════════════════════════════════════════════════════
    //                        CONSTRUCTOR
    // ═══════════════════════════════════════════════════════════════

    /// @notice Deploys the PSL TrustTicket contract. Deployer becomes the organizer (owner).
    constructor() ERC721("PSL TrustTicket", "PSLT") {
        // Deployer wallet = organizer. All admin functions are onlyOwner.
    }

    // ═══════════════════════════════════════════════════════════════
    //                    1. MATCH MANAGEMENT
    // ═══════════════════════════════════════════════════════════════

    /// @notice Create a new PSL match. Only the organizer (owner) can call this.
    /// @param _name Match display name (e.g., "LQ vs KK - Match 1")
    /// @param _venue Stadium name and city (e.g., "Gaddafi Stadium, Lahore")
    /// @param _date Unix timestamp for match start time
    /// @param _maxResalePercentage Maximum resale price as % of face value
    ///        (100 = no markup, 110 = 10% max markup, 150 = 50% max markup)
    /// @return matchId The ID assigned to this match
    function createMatch(
        string calldata _name,
        string calldata _venue,
        uint256 _date,
        uint256 _maxResalePercentage
    ) external onlyOwner returns (uint256) {
        require(_maxResalePercentage >= 100, "Resale cap must be >= 100%");
        require(bytes(_name).length > 0, "Match name cannot be empty");
        require(bytes(_venue).length > 0, "Venue cannot be empty");

        uint256 matchId = nextMatchId++;

        matches[matchId] = Match({
            name: _name,
            venue: _venue,
            date: _date,
            maxResalePercentage: _maxResalePercentage,
            active: true,
            collectible: false
        });

        emit MatchCreated(matchId, _name, _venue, _date);
        return matchId;
    }

    // ═══════════════════════════════════════════════════════════════
    //                    2. TICKET MINTING
    // ═══════════════════════════════════════════════════════════════

    /// @notice Mint a batch of tickets for a match. Tickets are held by the
    ///         contract until fans purchase them in the primary sale.
    /// @param _matchId The match these tickets belong to
    /// @param _tier Ticket tier: 0 = General, 1 = Premium, 2 = VIP
    /// @param _faceValue Ticket price in wei (immutable once minted)
    /// @param _quantity Number of tickets to mint (max 100 per call for gas safety)
    function mintTickets(
        uint256 _matchId,
        TicketTier _tier,
        uint256 _faceValue,
        uint256 _quantity
    ) external onlyOwner {
        require(matches[_matchId].active, "Match does not exist or is inactive");
        require(_faceValue > 0, "Face value must be greater than 0");
        require(_quantity > 0 && _quantity <= 100, "Quantity must be 1-100 per batch");

        for (uint256 i = 0; i < _quantity; i++) {
            uint256 tokenId = nextTokenId++;

            // Mint to contract address — contract holds tickets until purchased
            _mint(address(this), tokenId);

            tickets[tokenId] = Ticket({
                matchId: _matchId,
                tier: _tier,
                faceValue: _faceValue,
                forSale: false,
                listingPrice: 0,
                seller: address(0),
                used: false
            });

            emit TicketMinted(tokenId, _matchId, _tier, _faceValue);
        }
    }

    // ═══════════════════════════════════════════════════════════════
    //                     3. PRIMARY SALE
    // ═══════════════════════════════════════════════════════════════

    /// @notice Buy an available ticket by paying the exact face value.
    ///         The NFT transfers from the contract to the buyer's wallet.
    ///         Payment goes directly to the organizer.
    /// @param _tokenId The token ID of the ticket to purchase
    function buyTicket(uint256 _tokenId) external payable nonReentrant {
        require(_exists(_tokenId), "Ticket does not exist");
        require(ownerOf(_tokenId) == address(this), "Ticket not available for primary sale");
        require(!tickets[_tokenId].forSale, "Ticket is on the resale market");
        require(msg.value == tickets[_tokenId].faceValue, "Must pay exact face value");

        // Transfer NFT from contract to buyer
        _transfer(address(this), msg.sender, _tokenId);

        // Send payment to organizer (contract owner)
        (bool sent, ) = owner().call{value: msg.value}("");
        require(sent, "Payment to organizer failed");

        emit TicketPurchased(_tokenId, msg.sender, msg.value);
    }

    // ═══════════════════════════════════════════════════════════════
    //                  4. RESALE MARKETPLACE
    // ═══════════════════════════════════════════════════════════════

    /// @notice List your ticket for resale. The contract enforces the price cap.
    ///         Ticket is transferred to the contract as escrow to prevent double-selling.
    /// @dev Price cap formula: listingPrice <= faceValue * maxResalePercentage / 100
    /// @param _tokenId The ticket to list
    /// @param _price Your asking price in wei (must be within the match's resale cap)
    function listForResale(uint256 _tokenId, uint256 _price) external {
        require(ownerOf(_tokenId) == msg.sender, "You don't own this ticket");
        require(!tickets[_tokenId].used, "Cannot resell a used ticket");
        require(_price > 0, "Price must be greater than 0");

        // Enforce resale price cap
        uint256 matchId = tickets[_tokenId].matchId;
        uint256 maxPrice = tickets[_tokenId].faceValue * matches[matchId].maxResalePercentage / 100;
        require(_price <= maxPrice, "Price exceeds resale cap for this match");

        // Escrow: transfer ticket to contract
        _transfer(msg.sender, address(this), _tokenId);

        // Update listing state
        tickets[_tokenId].forSale = true;
        tickets[_tokenId].listingPrice = _price;
        tickets[_tokenId].seller = msg.sender;

        emit TicketListed(_tokenId, _price, msg.sender);
    }

    /// @notice Cancel your resale listing. Ticket returns to your wallet.
    /// @param _tokenId The ticket to delist
    function cancelListing(uint256 _tokenId) external {
        require(tickets[_tokenId].forSale, "Ticket is not listed for resale");
        require(tickets[_tokenId].seller == msg.sender, "You are not the seller");

        // Clear listing state
        tickets[_tokenId].forSale = false;
        tickets[_tokenId].listingPrice = 0;
        address seller = tickets[_tokenId].seller;
        tickets[_tokenId].seller = address(0);

        // Return ticket from escrow to seller
        _transfer(address(this), seller, _tokenId);

        emit TicketListingCancelled(_tokenId, seller);
    }

    /// @notice Buy a resale-listed ticket. 5% royalty goes to organizer, 95% to seller.
    /// @param _tokenId The listed ticket to buy
    function buyResale(uint256 _tokenId) external payable nonReentrant {
        require(tickets[_tokenId].forSale, "Ticket is not listed for resale");
        require(msg.value == tickets[_tokenId].listingPrice, "Must pay exact listing price");

        address seller = tickets[_tokenId].seller;
        uint256 royalty = msg.value * RESALE_ROYALTY_PERCENT / 100;
        uint256 sellerPayout = msg.value - royalty;

        // Clear listing state BEFORE transfers (checks-effects-interactions)
        tickets[_tokenId].forSale = false;
        tickets[_tokenId].listingPrice = 0;
        tickets[_tokenId].seller = address(0);

        // Transfer ticket from escrow to new buyer
        _transfer(address(this), msg.sender, _tokenId);

        // Pay seller (95%)
        (bool sentSeller, ) = seller.call{value: sellerPayout}("");
        require(sentSeller, "Payment to seller failed");

        // Pay royalty to organizer (5%)
        (bool sentRoyalty, ) = owner().call{value: royalty}("");
        require(sentRoyalty, "Royalty payment to organizer failed");

        emit TicketResold(_tokenId, msg.sender, seller, msg.value, royalty);
    }

    // ═══════════════════════════════════════════════════════════════
    //                  5. STADIUM GATE VERIFICATION
    // ═══════════════════════════════════════════════════════════════

    /// @notice Verify if a wallet owns a valid (unused) ticket. Called by gate scanners.
    /// @param _tokenId The ticket to verify
    /// @param _wallet The wallet address to check against
    /// @return valid True if the wallet owns the ticket AND it hasn't been used
    function verifyOwnership(uint256 _tokenId, address _wallet) external view returns (bool valid) {
        if (!_exists(_tokenId)) return false;
        return (ownerOf(_tokenId) == _wallet && !tickets[_tokenId].used);
    }

    /// @notice Mark a ticket as used at the stadium gate. Irreversible — prevents re-entry.
    /// @param _tokenId The ticket being scanned at the gate
    function markAsUsed(uint256 _tokenId) external onlyGateOrOwner {
        require(_exists(_tokenId), "Ticket does not exist");
        require(!tickets[_tokenId].used, "Ticket already used");
        require(ownerOf(_tokenId) != address(this), "Ticket has not been sold yet");

        tickets[_tokenId].used = true;

        emit TicketUsed(_tokenId, ownerOf(_tokenId));
    }

    // ═══════════════════════════════════════════════════════════════
    //                6. POST-MATCH COLLECTIBLE
    // ═══════════════════════════════════════════════════════════════

    /// @notice Mark a match as collectible after it ends. Tickets become permanent
    ///         digital souvenirs in fans' wallets. Irreversible.
    /// @param _matchId The match to mark as collectible
    function markAsCollectible(uint256 _matchId) external onlyOwner {
        require(matches[_matchId].active, "Match does not exist");
        require(!matches[_matchId].collectible, "Already marked as collectible");

        matches[_matchId].collectible = true;

        emit MatchMarkedCollectible(_matchId);
    }

    // ═══════════════════════════════════════════════════════════════
    //                 GATE OPERATOR MANAGEMENT
    // ═══════════════════════════════════════════════════════════════

    /// @notice Add or remove a gate operator who can scan tickets at the stadium.
    /// @param _operator The wallet address to authorize/deauthorize
    /// @param _status True = add operator, False = remove operator
    function setGateOperator(address _operator, bool _status) external onlyOwner {
        require(_operator != address(0), "Invalid operator address");
        gateOperators[_operator] = _status;
        emit GateOperatorUpdated(_operator, _status);
    }

    // ═══════════════════════════════════════════════════════════════
    //                     VIEW FUNCTIONS
    // ═══════════════════════════════════════════════════════════════

    /// @notice Get ticket core details
    /// @param _tokenId The ticket to query
    function getTicketInfo(uint256 _tokenId) external view returns (
        uint256 matchId,
        TicketTier tier,
        uint256 faceValue,
        bool used,
        address currentOwner
    ) {
        require(_exists(_tokenId), "Ticket does not exist");
        Ticket storage t = tickets[_tokenId];
        return (
            t.matchId,
            t.tier,
            t.faceValue,
            t.used,
            ownerOf(_tokenId)
        );
    }

    /// @notice Get ticket resale details
    /// @param _tokenId The ticket to query
    function getTicketResaleInfo(uint256 _tokenId) external view returns (
        bool forSale,
        uint256 listingPrice,
        address seller
    ) {
        require(_exists(_tokenId), "Ticket does not exist");
        Ticket storage t = tickets[_tokenId];
        return (
            t.forSale,
            t.listingPrice,
            t.seller
        );
    }

    /// @notice Check if a match has been marked as collectible
    /// @param _matchId The match to check
    function isMatchCollectible(uint256 _matchId) external view returns (bool) {
        require(matches[_matchId].active, "Match does not exist");
        return matches[_matchId].collectible;
    }

    /// @notice Get match details
    /// @param _matchId The match to query
    function getMatchDetails(uint256 _matchId) external view returns (
        string memory name,
        string memory venue,
        uint256 date,
        uint256 maxResalePercentage,
        bool active,
        bool collectible
    ) {
        require(matches[_matchId].active, "Match does not exist");
        Match memory m = matches[_matchId];
        return (m.name, m.venue, m.date, m.maxResalePercentage, m.active, m.collectible);
    }

    /// @notice Get all token IDs available for primary sale for a given match
    /// @param _matchId The match to filter by
    /// @return tokenIds Array of available token IDs
    function getAvailableTickets(uint256 _matchId) external view returns (uint256[] memory) {
        uint256 total = totalSupply();

        // First pass: count matching tickets
        uint256 count = 0;
        for (uint256 i = 0; i < total; i++) {
            uint256 tokenId = tokenByIndex(i);
            if (
                tickets[tokenId].matchId == _matchId &&
                ownerOf(tokenId) == address(this) &&
                !tickets[tokenId].forSale
            ) {
                count++;
            }
        }

        // Second pass: populate result array
        uint256[] memory result = new uint256[](count);
        uint256 idx = 0;
        for (uint256 i = 0; i < total; i++) {
            uint256 tokenId = tokenByIndex(i);
            if (
                tickets[tokenId].matchId == _matchId &&
                ownerOf(tokenId) == address(this) &&
                !tickets[tokenId].forSale
            ) {
                result[idx++] = tokenId;
            }
        }

        return result;
    }

    /// @notice Get all token IDs listed for resale for a given match
    /// @param _matchId The match to filter by
    /// @return tokenIds Array of resale-listed token IDs
    function getResaleTickets(uint256 _matchId) external view returns (uint256[] memory) {
        uint256 total = totalSupply();

        uint256 count = 0;
        for (uint256 i = 0; i < total; i++) {
            uint256 tokenId = tokenByIndex(i);
            if (tickets[tokenId].matchId == _matchId && tickets[tokenId].forSale) {
                count++;
            }
        }

        uint256[] memory result = new uint256[](count);
        uint256 idx = 0;
        for (uint256 i = 0; i < total; i++) {
            uint256 tokenId = tokenByIndex(i);
            if (tickets[tokenId].matchId == _matchId && tickets[tokenId].forSale) {
                result[idx++] = tokenId;
            }
        }

        return result;
    }

    /// @notice Get all ticket token IDs owned by a wallet for a specific match
    /// @param _wallet The wallet to check
    /// @param _matchId The match to filter by
    /// @return tokenIds Array of token IDs owned by the wallet for this match
    function getMyTickets(address _wallet, uint256 _matchId) external view returns (uint256[] memory) {
        uint256 balance = balanceOf(_wallet);

        uint256 count = 0;
        for (uint256 i = 0; i < balance; i++) {
            uint256 tokenId = tokenOfOwnerByIndex(_wallet, i);
            if (tickets[tokenId].matchId == _matchId) {
                count++;
            }
        }

        uint256[] memory result = new uint256[](count);
        uint256 idx = 0;
        for (uint256 i = 0; i < balance; i++) {
            uint256 tokenId = tokenOfOwnerByIndex(_wallet, i);
            if (tickets[tokenId].matchId == _matchId) {
                result[idx++] = tokenId;
            }
        }

        return result;
    }

    // ═══════════════════════════════════════════════════════════════
    //                    ON-CHAIN METADATA (tokenURI)
    // ═══════════════════════════════════════════════════════════════

    /// @dev Internal helper to build attribute JSON string (avoids stack-too-deep)
    function _buildAttributes(uint256 tokenId) internal view returns (string memory) {
        Ticket memory t = tickets[tokenId];
        Match memory m = matches[t.matchId];

        string memory tierStr = t.tier == TicketTier.General ? "General" :
                                t.tier == TicketTier.Premium ? "Premium" : "VIP";

        return string(abi.encodePacked(
            '{"trait_type":"Match","value":"', m.name, '"},',
            '{"trait_type":"Venue","value":"', m.venue, '"},',
            '{"trait_type":"Tier","value":"', tierStr, '"},',
            '{"trait_type":"Face Value (wei)","value":"', t.faceValue.toString(), '"},',
            '{"trait_type":"Status","value":"', t.used ? "Used" : "Active", '"},',
            '{"trait_type":"Collectible","value":"', m.collectible ? "Yes" : "No", '"}'
        ));
    }

    /// @notice Returns on-chain JSON metadata for each ticket NFT.
    /// @param tokenId The token to get metadata for
    /// @return A data:application/json;base64 URI with the ticket's metadata
    function tokenURI(uint256 tokenId) public view override(ERC721) returns (string memory) {
        require(_exists(tokenId), "URI query for nonexistent token");

        Ticket memory t = tickets[tokenId];
        Match memory m = matches[t.matchId];

        string memory tierStr = t.tier == TicketTier.General ? "General" :
                                t.tier == TicketTier.Premium ? "Premium" : "VIP";

        bytes memory json = abi.encodePacked(
            '{"name":"PSL TrustTicket #', tokenId.toString(),
            '","description":"', m.name, ' - ', tierStr, ' at ', m.venue,
            '","attributes":[', _buildAttributes(tokenId), ']}'
        );

        return string(abi.encodePacked(
            "data:application/json;base64,",
            Base64.encode(json)
        ));
    }

    /// @dev Override required by Solidity for ERC721Enumerable
    function _beforeTokenTransfer(
        address from,
        address to,
        uint256 tokenId,
        uint256 batchSize
    ) internal override(ERC721Enumerable) {
        super._beforeTokenTransfer(from, to, tokenId, batchSize);
    }

    /// @dev Override required by Solidity for ERC721Enumerable
    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721Enumerable)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}
