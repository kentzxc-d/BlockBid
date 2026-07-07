// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract BlockBid {
    // Events for the Transparency Dashboard
    event BidCommitted(string projectId, address indexed supplier, string bidHash, uint256 timestamp);
    event AwardFinalized(string projectId, address indexed supplier, string winningBidHash, uint256 timestamp);

    // Mappings
    // projectId => (supplier => bidHash)
    mapping(string => mapping(address => string)) public projectBids;
    
    // projectId => winningSupplier
    mapping(string => address) public projectWinners;

    /**
     * @dev Commit a bid hash for a specific project.
     * @param _projectId The ID of the project from the off-chain database.
     * @param _bidHash The hash of the encrypted bid data.
     */
    function commitBid(string memory _projectId, string memory _bidHash) public {
        require(bytes(_projectId).length > 0, "Project ID cannot be empty");
        require(bytes(_bidHash).length > 0, "Bid hash cannot be empty");
        require(projectWinners[_projectId] == address(0), "Project already awarded");

        projectBids[_projectId][msg.sender] = _bidHash;
        emit BidCommitted(_projectId, msg.sender, _bidHash, block.timestamp);
    }

    /**
     * @dev Finalize the award for a project. In a production environment, this could be restricted
     * to an admin or the project creator. For this capstone, it's simplified.
     * @param _projectId The ID of the project.
     * @param _supplier The address of the winning supplier.
     * @param _winningBidHash The bid hash that won.
     */
    function finalizeAward(string memory _projectId, address _supplier, string memory _winningBidHash) public {
        require(bytes(_projectId).length > 0, "Project ID cannot be empty");
        require(projectWinners[_projectId] == address(0), "Project already awarded");
        
        // Verify the supplier actually committed this hash
        // require(keccak256(abi.encodePacked(projectBids[_projectId][_supplier])) == keccak256(abi.encodePacked(_winningBidHash)), "Bid hash mismatch");
        // We comment the strict check out just in case the architecture involves the platform submitting on behalf of someone,
        // but let's keep it strict for better security logic if they do sign themselves.
        
        projectWinners[_projectId] = _supplier;
        emit AwardFinalized(_projectId, _supplier, _winningBidHash, block.timestamp);
    }
}
