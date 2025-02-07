# Charity Fundraising
## What is this project?

This project is a basic Charity Fundraising System. It allows users to create campaigns, donate to campaigns, and withdraw funds from campaigns when the goal is reached.

## How to use the project

### 1. Clone the project

Clone the project by running `git clone https://github.com/tsaqifrazin1/Charity-Fundraising.git`

### 2. Install dependencies

Install the dependencies by running `npm install`

### 3. Compile the contract

Compile the contract by running `npx hardhat compile`

### 4. Deploy the contract

Deploy the contract by running `npx hardhat run scripts/deploy.ts`

### 5. Run tests

Run the tests by running `npx hardhat test`

### 6. Interact with the contract

Interact with the contract by running `npx hardhat console`

You can use the following commands to interact with the contract:

- `charityFundraising.createCampaign("Help school", "Support the school", ethers.utils.parseEther("10"), 1000 * 60)` to create a new campaign
- `charityFundraising.donate(1, { value: ethers.utils.parseEther("10") })` to donate to a campaign
- `charityFundraising.withdraw(1)` to withdraw funds from a campaign when the goal is reached
