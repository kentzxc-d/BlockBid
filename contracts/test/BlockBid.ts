import { expect } from "chai";
import { ethers } from "hardhat";
import { parseEther } from "viem";

describe("BlockBid Escrow & Bidding System", function () {
  let blockBid: any;
  let blockBidToken: any;
  let owner: any;
  let supplier1: any;
  let supplier2: any;

  const DEPOSIT_AMOUNT = ethers.parseEther("100");

  beforeEach(async function () {
    [owner, supplier1, supplier2] = await ethers.getSigners();

    // 1. Deploy the Stablecoin Token
    const BlockBidToken = await ethers.getContractFactory("BlockBidToken");
    blockBidToken = await BlockBidToken.deploy();
    await blockBidToken.waitForDeployment();

    // 2. Deploy BlockBid Contract with Token Address and Deposit Amount
    const BlockBid = await ethers.getContractFactory("BlockBid");
    blockBid = await BlockBid.deploy(await blockBidToken.getAddress(), DEPOSIT_AMOUNT);
    await blockBid.waitForDeployment();

    // 3. Mint tokens to suppliers so they can bid
    await blockBidToken.mint(supplier1.address, ethers.parseEther("500"));
    await blockBidToken.mint(supplier2.address, ethers.parseEther("500"));
  });

  it("Should require a deposit to commit a bid", async function () {
    const projectId = "proj-123";
    const bidHash = "0xabc123";

    // Attempt to bid without approval (should fail)
    await expect(blockBid.connect(supplier1).commitBid(projectId, bidHash))
      .to.be.revertedWithCustomError(blockBidToken, "ERC20InsufficientAllowance");

    // Approve the contract to spend tokens
    await blockBidToken.connect(supplier1).approve(await blockBid.getAddress(), DEPOSIT_AMOUNT);

    // Commit bid successfully
    await expect(blockBid.connect(supplier1).commitBid(projectId, bidHash))
      .to.emit(blockBid, "BidCommitted")
      .withArgs(projectId, supplier1.address, bidHash, (val: any) => val > 0);

    // Verify deposit was taken
    const balance = await blockBidToken.balanceOf(supplier1.address);
    expect(balance).to.equal(ethers.parseEther("400")); // 500 - 100 deposit
  });

  it("Should deduct fee from winner and refund losers upon award", async function () {
    const projectId = "proj-123";
    const bidHash1 = "0xabc123";
    const bidHash2 = "0xdef456";

    const blockBidAddress = await blockBid.getAddress();

    // Supplier 1 bids
    await blockBidToken.connect(supplier1).approve(blockBidAddress, DEPOSIT_AMOUNT);
    await blockBid.connect(supplier1).commitBid(projectId, bidHash1);

    // Supplier 2 bids
    await blockBidToken.connect(supplier2).approve(blockBidAddress, DEPOSIT_AMOUNT);
    await blockBid.connect(supplier2).commitBid(projectId, bidHash2);

    const ownerInitialBalance = await blockBidToken.balanceOf(owner.address);

    // Finalize Award (Supplier 1 Wins)
    await expect(blockBid.connect(owner).finalizeAward(projectId, supplier1.address, bidHash1))
      .to.emit(blockBid, "AwardFinalized")
      .withArgs(projectId, supplier1.address, bidHash1, (val: any) => val > 0)
      .and.to.emit(blockBid, "DepositRefunded")
      .withArgs(projectId, supplier2.address, DEPOSIT_AMOUNT);

    // Winner (Supplier 1) should NOT get their deposit back (it's kept as a fee)
    const s1Balance = await blockBidToken.balanceOf(supplier1.address);
    expect(s1Balance).to.equal(ethers.parseEther("400"));

    // Loser (Supplier 2) should get their deposit refunded
    const s2Balance = await blockBidToken.balanceOf(supplier2.address);
    expect(s2Balance).to.equal(ethers.parseEther("500"));

    // Owner should receive the Winner's deposit as the platform fee
    const ownerFinalBalance = await blockBidToken.balanceOf(owner.address);
    expect(ownerFinalBalance - ownerInitialBalance).to.equal(DEPOSIT_AMOUNT);
  });
});
