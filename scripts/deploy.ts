import { ethers } from "hardhat";

async function main() {
    const [deployer] = await ethers.getSigners();
    console.log("Deploying contracts with the account:", deployer.address);
    const spaceDolphin = await ethers.deployContract("PAWA");
    await spaceDolphin.waitForDeployment();
    console.log("PAWA address:", await spaceDolphin.getAddress());

}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});