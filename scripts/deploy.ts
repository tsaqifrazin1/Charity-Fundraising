import { ethers } from "hardhat";

async function main() {
  const CharityFundraising = await ethers.getContractFactory("CharityFundraising");
  const charityFundraising = await CharityFundraising.deploy();

  await charityFundraising.waitForDeployment();

  console.log("CharityFundraising deployed to:", await charityFundraising.getAddress());
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
