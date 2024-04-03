import { ethers } from "hardhat";

async function main() {
    const [deployer] = await ethers.getSigners();
    console.log("Deploying contracts with the account:", deployer.address);
    const pawa = await ethers.deployContract("PAWA");
    await pawa.waitForDeployment();
    console.log("PAWA address:", await pawa.getAddress());

}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});