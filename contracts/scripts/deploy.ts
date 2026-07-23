import { ethers } from "hardhat";

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with the account:", deployer.address);

  const BlockBid = await ethers.getContractFactory("BlockBid");
  
  // The new BlockBid contract takes no constructor arguments
  const blockBid = await BlockBid.deploy();

  await blockBid.waitForDeployment();
  const address = await blockBid.getAddress();
  
  console.log("BlockBid deployed to:", address);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
