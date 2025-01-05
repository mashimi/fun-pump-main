const hre = require("hardhat");

async function main() {
  const Factory = await hre.ethers.getContractFactory("Factory");
  const factory = await Factory.deploy(ethers.parseUnits("0.01", 18)); // Replace with your constructor arguments

  await factory.waitForDeployment();

  console.log("Factory deployed to:", await factory.getAddress());
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});