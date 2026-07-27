import { ethers } from "hardhat";

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with the account:", deployer.address);

  // 1. We ALREADY deployed PHPB Stablecoin on Polygon Amoy, so we reuse it to save gas!
  // const BlockBidToken = await ethers.getContractFactory("BlockBidToken");
  // const token = await BlockBidToken.deploy();
  // await token.waitForDeployment();
  // const tokenAddress = await token.getAddress();
  const tokenAddress = "0x658a8E9781e76784391CC1C6b60f1EB7B0B948cd";
  console.log("Using existing BlockBidToken (PHPB) at:", tokenAddress);

  // 2. We ALREADY deployed the Escrow Contract on Amoy!
  // const BlockBid = await ethers.getContractFactory("BlockBid");
  // const blockBid = await BlockBid.deploy(tokenAddress);
  // await blockBid.waitForDeployment();
  // const blockBidAddress = await blockBid.getAddress();
  const blockBidAddress = "0xBfBa7FaA1af9117D408473B6124115F7ea1AdA12";
  console.log("Using existing BlockBid Escrow at:", blockBidAddress);

  // 3. Deploy VerifiedBadge (SBT)
  const VerifiedBadge = await ethers.getContractFactory("VerifiedBadge");
  // Hardhat is overestimating gas. We force maxFeePerGas to 35 gwei to prevent 0.3 POL costs.
  const badge = await VerifiedBadge.deploy(deployer.address, {
    maxFeePerGas: ethers.parseUnits("35", "gwei"),
    maxPriorityFeePerGas: ethers.parseUnits("35", "gwei")
  });
  await badge.waitForDeployment();
  const badgeAddress = await badge.getAddress();
  console.log("VerifiedBadge (SBT) deployed to:", badgeAddress);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
