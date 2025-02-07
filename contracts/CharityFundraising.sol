// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract CharityFundraising {
    // Struct and functions will be added later
    struct Campaign {
        address owner;
        string title;
        string description;
        uint goal;
        uint amountRaised;
        bool active;
    }

    mapping(uint => Campaign) campaigns;
    uint public campaignCount;

    event CampaignCreated(uint campaignCount, address owner, string title, string description, uint goal);
    event DonationReceived(uint campaignCount, address donor, uint amount);
    event Withdrawal(uint campaignCount, address owner, uint amount);

    function createCampaign(string memory _title, string memory _description, uint _goal) public {
        require(_goal > 0, "Goal must be greater than 0");

        campaignCount++;
        campaigns[campaignCount] = Campaign(msg.sender, _title, _description, _goal, 0, true);
        emit CampaignCreated(campaignCount, msg.sender, _title, _description, _goal);
    }

    function donate(uint _campaignId) public payable {
        require(campaigns[_campaignId].active, "Campaign is not active");
        require(msg.value > 0, "Donation must be greater than 0");

        campaigns[_campaignId].amountRaised += msg.value;
        emit DonationReceived(_campaignId, msg.sender, msg.value);
    }

    function withdraw(uint _campaignId) public {
        require(campaigns[_campaignId].active, "Campaign is not active");
        require(msg.sender == campaigns[_campaignId].owner, "Only the owner can withdraw");
        require(campaigns[_campaignId].amountRaised >= campaigns[_campaignId].goal, "Goal not reached");

        campaigns[_campaignId].active = false;
        uint amount = campaigns[_campaignId].amountRaised;
        
        payable(msg.sender).transfer(amount);
        emit Withdrawal(_campaignId, msg.sender, amount);
    }
}
