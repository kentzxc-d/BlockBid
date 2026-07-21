// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract BlockBid is Ownable {
    IERC20 public blockBidToken;
    uint256 public bidDepositAmount;

    // Events for the Transparency Dashboard
    event BidCommitted(string projectId, address indexed supplier, string bidHash, uint256 timestamp);
    event AwardFinalized(string projectId, address indexed supplier, string winningBidHash, uint256 timestamp);
    event DepositRefunded(string projectId, address indexed supplier, uint256 amount);

    // Mappings
    // projectId => (supplier => bidHash)
    mapping(string => mapping(address => string)) public projectBids;
    // projectId => (supplier => hasDeposited)
    mapping(string => mapping(address => bool)) public hasDeposited;
    // projectId => winningSupplier
    mapping(string => address) public projectWinners;
    // projectId => list of suppliers who bid
    mapping(string => address[]) public projectBiddersList;

    constructor(address _tokenAddress, uint256 _bidDepositAmount) Ownable(msg.sender) {
        blockBidToken = IERC20(_tokenAddress);
        bidDepositAmount = _bidDepositAmount;
    }

    function setBidDepositAmount(uint256 _amount) public onlyOwner {
        bidDepositAmount = _amount;
    }

    /**
     * @dev Commit a bid hash for a specific project. Requires transferring the bid deposit.
     */
    function commitBid(string memory _projectId, string memory _bidHash) public {
        require(bytes(_projectId).length > 0, "Project ID cannot be empty");
        require(bytes(_bidHash).length > 0, "Bid hash cannot be empty");
        require(projectWinners[_projectId] == address(0), "Project already awarded");
        require(!hasDeposited[_projectId][msg.sender], "Already bid on this project");

        // Transfer deposit from bidder to this contract
        require(blockBidToken.transferFrom(msg.sender, address(this), bidDepositAmount), "Deposit transfer failed");
        
        hasDeposited[_projectId][msg.sender] = true;
        projectBids[_projectId][msg.sender] = _bidHash;
        projectBiddersList[_projectId].push(msg.sender);

        emit BidCommitted(_projectId, msg.sender, _bidHash, block.timestamp);
    }

    /**
     * @dev Finalize the award. The winner's deposit is kept as fee. Losers get refunded.
     */
    function finalizeAward(string memory _projectId, address _supplier, string memory _winningBidHash) public onlyOwner {
        require(bytes(_projectId).length > 0, "Project ID cannot be empty");
        require(projectWinners[_projectId] == address(0), "Project already awarded");
        require(hasDeposited[_projectId][_supplier], "Winner did not submit a bid");

        projectWinners[_projectId] = _supplier;

        // Keep the winner's deposit as platform fee (send to owner/admin)
        blockBidToken.transfer(owner(), bidDepositAmount);

        // Refund all other bidders
        address[] memory bidders = projectBiddersList[_projectId];
        for (uint i = 0; i < bidders.length; i++) {
            if (bidders[i] != _supplier) {
                blockBidToken.transfer(bidders[i], bidDepositAmount);
                emit DepositRefunded(_projectId, bidders[i], bidDepositAmount);
            }
        }

        emit AwardFinalized(_projectId, _supplier, _winningBidHash, block.timestamp);
    }
}
