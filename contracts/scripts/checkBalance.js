const { ethers } = require("hardhat");

async function main() {
  const [deployer] = await ethers.getSigners();
  const balance = await ethers.provider.getBalance(deployer.address);
  console.log(`Balance for ${deployer.address}: ${ethers.formatEther(balance)} MATIC`);
}

main().catch(console.error);
