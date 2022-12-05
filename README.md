# Exclusible Technical Challenge

## Description
https://docs.google.com/document/d/1u0GMh_t9PxDUF1ui0YES90tt4y5E0GB4iP6-bbzyPaE/edit?usp=sharing

## 1) Setup a project and create a contract 

`yarn install`

https://github.com/Univdev99/Exclusible_challenge/blob/main/contracts/ETHPool.sol

### Compile contract

`npx hardhat compile`

## 2) Write tests

### Take coverage test to make sure that all codes are tested properly
`npx hardhat coverage`

## 3) Deploy contract

`npx hardhat run --network goerli scripts/deploy.js`

### Deployed contract on Goerli testnet
ETHPool: 0xcB319f6f164B5563a8F5EDd076A8184E41Ca5d06

### Verify contract

Using the hardhat-etherscan plugin, add Etherscan API key to hardhat.config.ts, then run:
`npx hardhat verify --network goerli <DEPLOYED ADDRESS>`

https://goerli.etherscan.io/address/0xcB319f6f164B5563a8F5EDd076A8184E41Ca5d06#code


## 4) Interact with the contract

### Took a hardhat test with ethers.js
https://github.com/Univdev99/Exclusible_challenge/blob/main/test/ETHPool.js

