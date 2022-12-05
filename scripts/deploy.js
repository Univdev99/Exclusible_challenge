import '@nomiclabs/hardhat-ethers'
import { ethers, run } from 'hardhat'

async function main() {
  const ETHPoolFactory = await ethers.getContractFactory('ETHPool')

  // If we had constructor arguments, they would be passed into deploy()
  const ETHPool = await ETHPoolFactory.deploy()

  // The contract is NOT deployed yet; we must wait until it is mined
  await ETHPool.deployed()

  
  console.log("**************************************");
  // The address the Contract WILL have once mined
  console.log("ETHPool:", ETHPool.address);
  console.log("**************************************");


  await run("verify:verify", {
    address: ETHPool.address,
    contract: "contracts/ETHPool.sol:ETHPool",
    constructorArguments: []
  });
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
