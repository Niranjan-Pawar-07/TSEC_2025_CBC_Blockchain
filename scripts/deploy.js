// We require the Hardhat Runtime Environment explicitly here
const hre = require("hardhat");

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying contracts with the account:", deployer.address);

  const balance = await deployer.getBalance();
  console.log("Account balance:", (await balance).toString());

  const TradeAgreement = await hre.ethers.getContractFactory("TradeAgreement");
  const tradeAgreement = await TradeAgreement.deploy();

  console.log("Waiting for deployment...");
  await tradeAgreement.waitForDeployment();

  const address = await tradeAgreement.getAddress();
  console.log("TradeAgreement deployed to:", address);
}

// Handle errors
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });