import { ethers } from "hardhat";

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with the account:", deployer.address);

  const BlockBid = await ethers.getContractFactory("BlockBid");
  const blockBid = await BlockBid.deploy();
  await blockBid.waitForDeployment();
  console.log(`BlockBid deployed to: ${await blockBid.getAddress()}`);

  const VerifiedBadge = await ethers.getContractFactory("VerifiedBadge");
  const verifiedBadge = await VerifiedBadge.deploy(deployer.address);
  await verifiedBadge.waitForDeployment();
  console.log(`VerifiedBadge deployed to: ${await verifiedBadge.getAddress()}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
