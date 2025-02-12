// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "hardhat/console.sol";
contract CharityFundraising {
    // Struct and functions will be added later
    struct Campaign {
        address owner;
        string title;
        string description;
        uint goal;
        uint amountRaised;
        uint deadline;
        bool active;
    }

    mapping(uint => Campaign) public campaigns;
    uint public campaignCount;

    event CampaignCreated(
        uint campaignCount,
        address owner,
        string title,
        string description,
        uint goal,
        uint deadline
    );
    event DonationReceived(uint campaignCount, address donor, uint amount);
    event Withdrawal(uint campaignCount, address owner, uint amount);
    event Refund(uint campaignCount, address donor, uint amount);

    function createCampaign(
        string memory _title,
        string memory _description,
        uint _goal,
        uint _duration
    ) public {
        require(_goal > 0, "Goal must be greater than 0");

        campaignCount++;
        campaigns[campaignCount] = Campaign(
            msg.sender,
            _title,
            _description,
            _goal,
            0,
            block.timestamp + _duration, // Set deadline
            true
        );

        emit CampaignCreated(
            campaignCount,
            msg.sender,
            _title,
            _description,
            _goal,
            block.timestamp + _duration
        );
    }

    function donate(uint _campaignId) public payable {
        Campaign storage campaign = campaigns[_campaignId];

        require(campaign.active, "Campaign is not active");
        require(block.timestamp < campaign.deadline, "Campaign deadline has passed");
        require(msg.value > 0, "Donation must be greater than 0");

        campaign.amountRaised += msg.value;
        emit DonationReceived(_campaignId, msg.sender, msg.value);
    }

    function withdraw(uint _campaignId) public {
        Campaign storage campaign = campaigns[_campaignId];
        require(campaign.active, "Campaign is not active");
        require(block.timestamp > campaign.deadline, "Deadline has not passed");
        require(msg.sender == campaign.owner, "Only the owner can withdraw");
        require(campaign.amountRaised >= campaign.goal, "Goal not reached");

        campaign.active = false;
        uint amount = campaign.amountRaised;

        payable(msg.sender).transfer(amount);
        emit Withdrawal(_campaignId, msg.sender, amount);
    }

    function refund(uint _campaignId) public {
        Campaign storage campaign = campaigns[_campaignId];
        require(campaign.active, "Campaign is not active");
        require(block.timestamp >= campaign.deadline, "Deadline has not passed");
        require(msg.sender != campaign.owner, "Owner cannot refund");

        uint amount = campaign.amountRaised;
        campaign.amountRaised = 0;

        payable(msg.sender).transfer(amount);
        emit Refund(_campaignId, msg.sender, amount);
    }
}
