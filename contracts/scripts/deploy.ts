import { ethers } from "hardhat";

async function main() {
  const BlockBid = await ethers.getContractFactory("BlockBid");
  const blockBid = await BlockBid.deploy();

  await blockBid.waitForDeployment();

  console.log(`BlockBid deployed to: ${await blockBid.getAddress()}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
