import { ethers } from "hardhat";

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with the account:", deployer.address);

  // 1. Deploy the PHPB Stablecoin Token
  const BlockBidToken = await ethers.getContractFactory("BlockBidToken");
  const token = await BlockBidToken.deploy();
  await token.waitForDeployment();
  const tokenAddress = await token.getAddress();
  console.log("BlockBidToken (PHPB) deployed to:", tokenAddress);

  // 2. Deploy the BlockBid Escrow Contract
  const BlockBid = await ethers.getContractFactory("BlockBid");
  
  // Pass the token address to the constructor
  const blockBid = await BlockBid.deploy(tokenAddress);
  await blockBid.waitForDeployment();
  const address = await blockBid.getAddress();
  console.log("BlockBid deployed to:", address);

  // 3. Deploy VerifiedBadge (SBT)
  const VerifiedBadge = await ethers.getContractFactory("VerifiedBadge");
  const badge = await VerifiedBadge.deploy();
  await badge.waitForDeployment();
  const badgeAddress = await badge.getAddress();
  console.log("VerifiedBadge (SBT) deployed to:", badgeAddress);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
