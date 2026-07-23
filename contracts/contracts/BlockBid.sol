// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";

contract BlockBid is Ownable {
    // Events for the Transparency Dashboard and Vouchers
    event BidCommitted(string acquisitionId, address indexed supplier, string bidHash, uint256 timestamp);
    event AwardFinalized(string acquisitionId, address indexed supplier, string winningBidHash, uint256 timestamp);
    event PaymentGuaranteeIssued(string acquisitionId, address indexed supplier, uint256 timestamp);

    // Mappings
    // acquisitionId => (supplier => bidHash)
    mapping(string => mapping(address => string)) public acquisitionBids;
    // acquisitionId => (supplier => hasBid)
    mapping(string => mapping(address => bool)) public hasBid;
    // acquisitionId => winningSupplier
    mapping(string => address) public acquisitionWinners;
    // acquisitionId => list of suppliers who bid
    mapping(string => address[]) public acquisitionBiddersList;
    // acquisitionId => delivery confirmed (voucher issued)
    mapping(string => bool) public deliveryConfirmed;

    // We assume the ICT Head is the owner of this contract for the pilot test.
    constructor() Ownable(msg.sender) {}

    /**
     * @dev Supplier commits a bid hash for a specific acquisition.
     */
    function commitBid(string memory _acquisitionId, string memory _bidHash) public {
        require(bytes(_acquisitionId).length > 0, "Acquisition ID cannot be empty");
        require(bytes(_bidHash).length > 0, "Bid hash cannot be empty");
        require(acquisitionWinners[_acquisitionId] == address(0), "Acquisition already awarded");
        require(!hasBid[_acquisitionId][msg.sender], "Already bid on this acquisition");

        hasBid[_acquisitionId][msg.sender] = true;
        acquisitionBids[_acquisitionId][msg.sender] = _bidHash;
        acquisitionBiddersList[_acquisitionId].push(msg.sender);

        emit BidCommitted(_acquisitionId, msg.sender, _bidHash, block.timestamp);
    }

    /**
     * @dev ICT Head finalizes the award, selecting the winning supplier.
     */
    function finalizeAward(string memory _acquisitionId, address _supplier, string memory _winningBidHash) public onlyOwner {
        require(bytes(_acquisitionId).length > 0, "Acquisition ID cannot be empty");
        require(acquisitionWinners[_acquisitionId] == address(0), "Acquisition already awarded");
        require(hasBid[_acquisitionId][_supplier], "Winner did not submit a bid");

        acquisitionWinners[_acquisitionId] = _supplier;

        emit AwardFinalized(_acquisitionId, _supplier, _winningBidHash, block.timestamp);
    }

    /**
     * @dev ICT Head confirms delivery. This acts as the Digital Payment Guarantee Voucher.
     */
    function confirmDelivery(string memory _acquisitionId) public onlyOwner {
        require(acquisitionWinners[_acquisitionId] != address(0), "Acquisition not awarded yet");
        require(!deliveryConfirmed[_acquisitionId], "Delivery already confirmed");

        deliveryConfirmed[_acquisitionId] = true;
        address winner = acquisitionWinners[_acquisitionId];

        emit PaymentGuaranteeIssued(_acquisitionId, winner, block.timestamp);
    }
}
