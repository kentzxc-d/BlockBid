// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title VerifiedBadge
 * @dev A Soulbound Token (SBT) representing KYC/KYB verification for BlockBid users.
 * This token cannot be transferred once minted.
 * Only the contract owner (admin) can mint or burn these tokens.
 */
contract VerifiedBadge is ERC721, Ownable {
    uint256 private _nextTokenId;

    // Mapping from user address to their token ID (since 1 address = 1 badge max)
    mapping(address => uint256) public userToTokenId;

    event BadgeMinted(address indexed to, uint256 indexed tokenId);
    event BadgeRevoked(address indexed from, uint256 indexed tokenId);

    constructor(address initialOwner) ERC721("BlockBid Verified Badge", "VERIFIED") Ownable(initialOwner) {}

    /**
     * @dev Mint a new verification badge to a user. Only callable by admin.
     * @param to The address of the verified user.
     */
    function adminMint(address to) public onlyOwner {
        require(balanceOf(to) == 0, "User already has a badge");
        uint256 tokenId = _nextTokenId++;
        
        userToTokenId[to] = tokenId;
        _safeMint(to, tokenId);
        
        emit BadgeMinted(to, tokenId);
    }

    /**
     * @dev Revoke a verification badge from a user. Only callable by admin.
     * @param from The address to revoke the badge from.
     */
    function adminBurn(address from) public onlyOwner {
        uint256 tokenId = userToTokenId[from];
        require(ownerOf(tokenId) == from, "User does not own this token or it does not exist");
        
        delete userToTokenId[from];
        _burn(tokenId);
        
        emit BadgeRevoked(from, tokenId);
    }

    /**
     * @dev Override the _update function to prevent transfers (Soulbound logic).
     * The `_update` function is called by ERC721 during mints, burns, and transfers.
     * If `from` is address(0), it's a mint.
     * If `to` is address(0), it's a burn.
     * Anything else is a transfer, which we block.
     */
    function _update(address to, uint256 tokenId, address auth)
        internal
        override
        returns (address)
    {
        address from = _ownerOf(tokenId);
        
        // Prevent transfers (SBT logic)
        require(
            from == address(0) || to == address(0),
            "VerifiedBadge: Token is Soulbound and cannot be transferred"
        );
        
        return super._update(to, tokenId, auth);
    }

    /**
     * @dev Returns a generic token URI for the verified badge.
     * Since all badges are the same, they share the same metadata.
     */
    function tokenURI(uint256 /*tokenId*/) public pure override returns (string memory) {
        // You can replace this with an IPFS link or hosted JSON metadata later
        return "https://blockbid.app/metadata/verified-badge.json";
    }
}
