import { ethers } from "hardhat";

async function main() {
  console.log("Starting deployment to Polygon Amoy...");
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with the account:", deployer.address);

  // 1. BlockBidToken (Already Deployed)
  const tokenAddress = "0xf13F948Caa523d1c45e8eD3e52683412f4C95edd";
  console.log("✅ BlockBidToken already deployed at:", tokenAddress);

  // 2. BlockBid Escrow (Already Deployed)
  const blockBidAddress = "0xE4Fd55A57db9457637A5cE91CABba2f510B239F2";
  console.log("✅ BlockBid (Escrow) already deployed at:", blockBidAddress);

  // 3. Deploy VerifiedBadge (KYC Soulbound Token)
  const VerifiedBadge = await ethers.getContractFactory("VerifiedBadge");
  const badge = await VerifiedBadge.deploy(deployer.address);
  await badge.waitForDeployment();
  const badgeAddress = await badge.getAddress();
  console.log("✅ VerifiedBadge (KYC) deployed to:", badgeAddress);

  console.log("\n--- DEPLOYMENT SUMMARY ---");
  console.log(`NEXT_PUBLIC_BLOCKBID_TOKEN_ADDRESS=${tokenAddress}`);
  console.log(`NEXT_PUBLIC_BLOCKBID_ESCROW_ADDRESS=${blockBidAddress}`);
  console.log(`NEXT_PUBLIC_VERIFIED_BADGE_ADDRESS=${badgeAddress}`);
  console.log("--------------------------");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
