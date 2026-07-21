import { expect } from "chai";
import { ethers } from "hardhat";

describe("BlockBidToken", function () {
  it("Should mint tokens if called by owner", async function () {
    const [owner, user] = await ethers.getSigners();
    const Token = await ethers.getContractFactory("BlockBidToken");
    const token = await Token.deploy();
    
    await token.mint(user.address, 1000);
    expect(await token.balanceOf(user.address)).to.equal(1000);
  });
});
