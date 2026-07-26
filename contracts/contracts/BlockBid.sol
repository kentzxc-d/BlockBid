// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract BlockBid is Ownable {
    // Events for the Transparency Dashboard and Vouchers
    event BidCommitted(string acquisitionId, address indexed supplier, string bidHash, uint256 bondAmount, uint256 timestamp);
    event AwardFinalized(string acquisitionId, address indexed supplier, string winningBidHash, uint256 timestamp);
    event BidBondRefunded(string acquisitionId, address indexed supplier, uint256 amount, uint256 timestamp);
    event PaymentGuaranteeIssued(string acquisitionId, address indexed supplier, uint256 timestamp);

    IERC20 public phpbToken;
    uint256 public refundLockDuration = 120 days;

    // Mappings
    // acquisitionId => (supplier => bidHash)
    mapping(string => mapping(address => string)) public acquisitionBids;
    // acquisitionId => (supplier => hasBid)
    mapping(string => mapping(address => bool)) public hasBid;
    // acquisitionId => (supplier => amount of PHPB locked)
    mapping(string => mapping(address => uint256)) public lockedBonds;
    // acquisitionId => winningSupplier
    mapping(string => address) public acquisitionWinners;
    // acquisitionId => list of suppliers who bid
    mapping(string => address[]) public acquisitionBiddersList;
    // acquisitionId => delivery confirmed (voucher issued)
    mapping(string => bool) public deliveryConfirmed;
    // acquisitionId => timestamp of award
    mapping(string => uint256) public awardedAt;

    // We assume the ICT Head is the owner of this contract for the pilot test.
    constructor(address _phpbTokenAddress) Ownable(msg.sender) {
        phpbToken = IERC20(_phpbTokenAddress);
    }

    /**
     * @dev Sets the lock duration before a winner can claim a refund (Default 120 days)
     */
    function setRefundLockDuration(uint256 _duration) public onlyOwner {
        refundLockDuration = _duration;
    }

    /**
     * @dev Supplier commits a bid hash and locks 1% PHPB Bid Bond
     */
    function commitBid(string memory _acquisitionId, string memory _bidHash, uint256 _bondAmount) public {
        require(bytes(_acquisitionId).length > 0, "Acquisition ID cannot be empty");
        require(bytes(_bidHash).length > 0, "Bid hash cannot be empty");
        require(acquisitionWinners[_acquisitionId] == address(0), "Acquisition already awarded");
        require(!hasBid[_acquisitionId][msg.sender], "Already bid on this acquisition");
        require(_bondAmount > 0, "Bond amount must be greater than 0");

        // Transfer PHPB tokens from supplier to this contract (Supplier must approve first)
        require(phpbToken.transferFrom(msg.sender, address(this), _bondAmount), "Token transfer failed. Check allowance.");

        hasBid[_acquisitionId][msg.sender] = true;
        acquisitionBids[_acquisitionId][msg.sender] = _bidHash;
        lockedBonds[_acquisitionId][msg.sender] = _bondAmount;
        acquisitionBiddersList[_acquisitionId].push(msg.sender);

        emit BidCommitted(_acquisitionId, msg.sender, _bidHash, _bondAmount, block.timestamp);
    }

    /**
     * @dev ICT Head finalizes the award, selects winner, and auto-refunds all losers
     */
    function finalizeAward(string memory _acquisitionId, address _supplier, string memory _winningBidHash) public onlyOwner {
        require(bytes(_acquisitionId).length > 0, "Acquisition ID cannot be empty");
        require(acquisitionWinners[_acquisitionId] == address(0), "Acquisition already awarded");
        require(hasBid[_acquisitionId][_supplier], "Winner did not submit a bid");

        acquisitionWinners[_acquisitionId] = _supplier;
        awardedAt[_acquisitionId] = block.timestamp;

        // Auto-refund all losers (Option 3 implementation)
        address[] memory bidders = acquisitionBiddersList[_acquisitionId];
        for (uint i = 0; i < bidders.length; i++) {
            address bidder = bidders[i];
            if (bidder != _supplier) {
                uint256 bondAmount = lockedBonds[_acquisitionId][bidder];
                if (bondAmount > 0) {
                    lockedBonds[_acquisitionId][bidder] = 0; // Prevent re-entrancy
                    require(phpbToken.transfer(bidder, bondAmount), "Refund transfer failed");
                    emit BidBondRefunded(_acquisitionId, bidder, bondAmount, block.timestamp);
                }
            }
        }

        emit AwardFinalized(_acquisitionId, _supplier, _winningBidHash, block.timestamp);
    }

    /**
     * @dev Winner claims their refund if the government delays NTP beyond 120 days
     */
    function claimWinnerRefund(string memory _acquisitionId) public {
        require(acquisitionWinners[_acquisitionId] == msg.sender, "Only the winner can claim this refund");
        require(!deliveryConfirmed[_acquisitionId], "Delivery already confirmed, bond is secured");
        require(awardedAt[_acquisitionId] > 0, "Acquisition not awarded yet");
        require(block.timestamp >= awardedAt[_acquisitionId] + refundLockDuration, "Refund lock period has not expired yet");

        uint256 bondAmount = lockedBonds[_acquisitionId][msg.sender];
        require(bondAmount > 0, "No locked bond to refund");

        lockedBonds[_acquisitionId][msg.sender] = 0; // Prevent re-entrancy
        require(phpbToken.transfer(msg.sender, bondAmount), "Refund transfer failed");

        emit BidBondRefunded(_acquisitionId, msg.sender, bondAmount, block.timestamp);
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
