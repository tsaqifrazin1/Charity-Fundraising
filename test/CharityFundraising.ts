import { ethers } from "hardhat";
import { time } from "@nomicfoundation/hardhat-network-helpers";

const { expect } = require("chai");

describe("CharityFundraising", function () {
  let CharityFundraising: any;
  let charityFundraising: any;
  let owner: any;
  let donor: any;

  beforeEach(async function () {
    CharityFundraising = await ethers.getContractFactory("CharityFundraising");
    charityFundraising = await CharityFundraising.deploy();
    await charityFundraising.waitForDeployment();
    [owner, donor] = await ethers.getSigners();
  });

  it("Should create a new campaign", async function () {
    const block = await ethers.provider.getBlock("latest");
    if (!block) {
      throw new Error("Failed to fetch the latest block");
    }
    await expect(charityFundraising.createCampaign("Help school", "Support the school", ethers.parseEther("10"), 1000 * 60))
      .to.emit(charityFundraising, "CampaignCreated")
      .withArgs(1, owner.address, "Help school", "Support the school", ethers.parseEther("10"), block.timestamp + 1 + 1000 * 60);

    const campaign = await charityFundraising.campaigns(1);
    expect(campaign.owner).to.equal(owner.address);
    expect(campaign.title).to.equal("Help school");
    expect(campaign.description).to.equal("Support the school");
    expect(campaign.goal).to.equal(ethers.parseEther("10"));
    expect(campaign.amountRaised).to.equal(0);
    expect(campaign.active).to.equal(true);
  });

  it("Should failed to create a new campaign if the goal is zero", async function () {
    await expect(charityFundraising
      .createCampaign("Help school", "Support the school", 0, 1000 * 60))
      .to.be.revertedWith("Goal must be greater than 0");
  });

  it("Should success to donate if the value", async function () {
    await charityFundraising.createCampaign("Help school", "Support the school", ethers.parseEther("10"), 1000 * 60);

    await expect(charityFundraising.donate(1, { value: ethers.parseEther("1") }))
      .to.emit(charityFundraising, "DonationReceived")
      .withArgs(1, owner.address, ethers.parseEther("1"));

    const campaign = await charityFundraising.campaigns(1);
    expect(campaign.amountRaised).to.equal(ethers.parseEther("1"));
  })

  it("Should failed to donate if the value is below 0", async function () {
    await charityFundraising.createCampaign("Help school", "Support the school", ethers.parseEther("10"), 1000 * 60);

    await expect(charityFundraising
      .donate(1))
      .to.be.revertedWith("Donation must be greater than 0");
  })

  it("Should failed to donate if the campaign is not active", async function () {
    await charityFundraising.createCampaign("Help school", "Support the school", ethers.parseEther("10"), 1000 * 60);

    await charityFundraising.donate(1, { value: ethers.parseEther("10") });

    await time.increase(1000 * 61)
    await charityFundraising.withdraw(1);

    const campaign = await charityFundraising.campaigns(1);
    expect(campaign.active).to.equal(false);

    await expect(charityFundraising.donate(1, { value: ethers.parseEther("10") }))
      .to.be.revertedWith("Campaign is not active")
  })

  it("Should failed to donate if the campaign deadline has passed", async function () {
    await charityFundraising.createCampaign("Help school", "Support the school", ethers.parseEther("10"), 1000 * 60);

    await time.increase(1000 * 61)
    await expect(charityFundraising.donate(1, { value: ethers.parseEther("10") }))
      .to.be.revertedWith("Campaign deadline has passed")
  })

  it("Should success to withdraw", async function () {
    await charityFundraising.createCampaign("Help school", "Support the school", ethers.parseEther("10"), 1000 * 60);
    await charityFundraising.donate(1, { value: ethers.parseEther("10") });

    await time.increase(1000 * 61)
    await expect(charityFundraising.withdraw(1))
      .to.emit(charityFundraising, "Withdrawal")
      .withArgs(1, owner.address, ethers.parseEther("10"));

    const campaign = await charityFundraising.campaigns(1);
    expect(campaign.amountRaised).to.equal(ethers.parseEther("10"));
    expect(campaign.active).to.equal(false);
  })

  it("Should failed to withdraw if the campaign is not active", async function () {
    await charityFundraising.createCampaign("Help school", "Support the school", ethers.parseEther("10"), 1000 * 60);

    await charityFundraising.donate(1, { value: ethers.parseEther("10") });

    await time.increase(1000 * 61)
    await charityFundraising.withdraw(1);
    await expect(charityFundraising.withdraw(1))
      .to.be.revertedWith("Campaign is not active")
  })

  it("Should failed to withdraw if the caller is not the owner", async function () {
    await charityFundraising.createCampaign("Help school", "Support the school", ethers.parseEther("10"), 1000 * 60);

    await charityFundraising.donate(1, { value: ethers.parseEther("10") });

    await time.increase(1000 * 61)
    await expect(charityFundraising.connect(donor)
      .withdraw(1))
      .to.be.revertedWith("Only the owner can withdraw");
  });

  it("Should failed to withdraw if the Goal is not reached", async function () {
    await charityFundraising.createCampaign("Help school", "Support the school", ethers.parseEther("10"), 1000 * 60);

    await time.increase(1000 * 61)
    await expect(charityFundraising
      .withdraw(1))
      .to.be.revertedWith("Goal not reached");
  })

  it("Should failed to withdraw if the deadline has not passed", async function () {
    await charityFundraising.createCampaign("Help school", "Support the school", ethers.parseEther("10"), 1000 * 60);
    await charityFundraising.donate(1, { value: ethers.parseEther("10") });

    await expect(charityFundraising
      .withdraw(1))
      .to.be.revertedWith("Deadline has not passed");
  })

  it("Should success to refund", async function () {
    await charityFundraising.createCampaign("Help school", "Support the school", ethers.parseEther("10"), 1000 * 60);
    await charityFundraising.connect(donor).donate(1, { value: ethers.parseEther("10") });

    await time.increase(1000 * 61)
    await expect(charityFundraising.connect(donor).refund(1))
      .to.emit(charityFundraising, "Refund")
      .withArgs(1, donor.address, ethers.parseEther("10"));

    const campaign = await charityFundraising.campaigns(1);
    expect(campaign.amountRaised).to.equal(0);
  })

  it("Should failed to refund if the campaign is not active", async function () {
    await charityFundraising.createCampaign("Help school", "Support the school", ethers.parseEther("10"), 1000 * 60);
    await charityFundraising.connect(donor).donate(1, { value: ethers.parseEther("10") });

    await time.increase(1000 * 61)
    await charityFundraising.withdraw(1);

    await expect(charityFundraising.connect(donor).refund(1))
      .to.be.revertedWith("Campaign is not active");
  })

  it("Should failed to refund if the deadline has not passed", async function () {
    await charityFundraising.createCampaign("Help school", "Support the school", ethers.parseEther("10"), 1000 * 60);
    await charityFundraising.connect(donor).donate(1, { value: ethers.parseEther("10") });

    await expect(charityFundraising.connect(donor).refund(1))
      .to.be.revertedWith("Deadline has not passed");
  })

  it("Should failed to refund if the caller is not the donor", async function () {
    await charityFundraising.createCampaign("Help school", "Support the school", ethers.parseEther("10"), 1000 * 60);
    await charityFundraising.connect(donor).donate(1, { value: ethers.parseEther("10") });

    await time.increase(1000 * 61)
    await expect(charityFundraising.refund(1))
      .to.be.revertedWith("Owner cannot refund");
  })
});
