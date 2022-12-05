// SPDX-License-Identifier: MIT
pragma solidity ^0.8.15;

import "@openzeppelin/contracts/access/AccessControl.sol";

contract ETHPool is AccessControl {
    event Deposit(address indexed _address, uint256 _amount);
    event Withdraw(address indexed _address, uint256 _amount);

    bytes32 public constant EXCLUSIBLE_TEAM_ROLE = keccak256("EXCLUSIBLE_TEAM_ROLE");

    struct DepositAmount {
        uint256 amount;
        bool isDepositable;
    }

    uint256 public totalFunds;
  
    address[] public users;  

    mapping(address => DepositAmount) public deposits;

    constructor() {
        _setupRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _setupRole(EXCLUSIBLE_TEAM_ROLE, msg.sender);
    }

    receive() external payable {
        if(!deposits[msg.sender].isDepositable) // only pushes new users
            users.push(msg.sender);

        deposits[msg.sender].amount += msg.value;
        deposits[msg.sender].isDepositable = true;

        totalFunds += msg.value;

        emit Deposit(msg.sender, msg.value);
    }
    
    function depositRewards() public payable onlyRole(EXCLUSIBLE_TEAM_ROLE) {
        require(totalFunds > 0); // No rewards to distribute if the pool is empty.

        for (uint i = 0; i < users.length; i++){
            
           address user = users[i];

           uint rewards = ((deposits[user].amount * msg.value) / totalFunds);

           deposits[user].amount += rewards;
        }
    }

    function withdraw() public {
        uint256 deposit = deposits[msg.sender].amount;
        
        require(deposit > 0, "ETHPool.withdraw: No fund left to withdraw");

        deposits[msg.sender].amount = 0;

        (bool success, ) = msg.sender.call{value:deposit}("");
  
        require(success, "ETHPool.withdraw: Transaction failed");

        emit Withdraw(msg.sender, deposit);
    }

    function addTeamMember(address account) public {
        grantRole(EXCLUSIBLE_TEAM_ROLE, account);
    }

    function removeTeamMember(address account) public {
        revokeRole(EXCLUSIBLE_TEAM_ROLE, account);
    }
}