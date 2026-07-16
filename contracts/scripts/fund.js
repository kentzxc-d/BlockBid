const hre = require("hardhat");

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  const receiver = "0xf420986c72d71809807e60c79fE25D33DB23025A";
  const amount = hre.ethers.parseEther("0.05");

  console.log("Sending 0.05 POL from", deployer.address, "to", receiver);

  const tx = await deployer.sendTransaction({
    to: receiver,
    value: amount,
  });

  console.log("Transaction hash:", tx.hash);
  await tx.wait();
  console.log("Funds sent successfully!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
