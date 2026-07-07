import { expect } from "chai";
import { ethers } from "hardhat";

describe("BlockBid", function () {
  let blockBid: any;
  let owner: any;
  let supplier1: any;
  let supplier2: any;

  beforeEach(async function () {
    const BlockBid = await ethers.getContractFactory("BlockBid");
    blockBid = await BlockBid.deploy();
    [owner, supplier1, supplier2] = await ethers.getSigners();
  });

  it("Should allow a supplier to commit a bid", async function () {
    const projectId = "proj-123";
    const bidHash = "0xabc123";

    await expect(blockBid.connect(supplier1).commitBid(projectId, bidHash))
      .to.emit(blockBid, "BidCommitted")
      .withArgs(projectId, supplier1.address, bidHash, (val: any) => val > 0);

    const storedHash = await blockBid.projectBids(projectId, supplier1.address);
    expect(storedHash).to.equal(bidHash);
  });

  it("Should allow finalization of an award", async function () {
    const projectId = "proj-123";
    const bidHash = "0xabc123";

    await blockBid.connect(supplier1).commitBid(projectId, bidHash);

    await expect(blockBid.connect(owner).finalizeAward(projectId, supplier1.address, bidHash))
      .to.emit(blockBid, "AwardFinalized")
      .withArgs(projectId, supplier1.address, bidHash, (val: any) => val > 0);

    const winner = await blockBid.projectWinners(projectId);
    expect(winner).to.equal(supplier1.address);
  });
});
