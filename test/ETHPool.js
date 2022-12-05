const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("ETHPool", function () {
  let owner, alice, bob;
  let ETHPool;
    
  beforeEach(async function() {
      [owner, alice, bob] = await ethers.getSigners();

      let ETHPoolFactory = await ethers.getContractFactory("ETHPool");
      ETHPool = await ETHPoolFactory.deploy();
      
      await ETHPool.deployed();
  });

  it("Should allow deposits", async function () {
    const oneEth = ethers.BigNumber.from("1000000000000000000");

    let tx = {
      to: ETHPool.address,
      value: oneEth
    };
  
    await owner.sendTransaction(tx);
    
    expect(await ETHPool.totalFunds()).to.be.equal(oneEth);
  });

  it("Should allow deposits from multiple users", async function () {
    const oneEth = ethers.BigNumber.from("1000000000000000000");

    let tx = {
      to: ETHPool.address,
      value: oneEth
    };
  
    await owner.sendTransaction(tx);

    await alice.sendTransaction(tx);
    
    expect(await ETHPool.totalFunds()).to.be.equal(oneEth.mul(2));
  });

  it("Should allow multiple deposits from single user", async function () {
    const oneEth = ethers.BigNumber.from("1000000000000000000");

    let tx = {
      to: ETHPool.address,
      value: oneEth
    };
  
    await owner.sendTransaction(tx);
    await owner.sendTransaction(tx);
    
    expect(await ETHPool.totalFunds()).to.be.equal(oneEth.mul(2));
  });
  
  it("Should withdraw same amount when rewards were not distributed", async function () {
    const balance = await owner.getBalance();
    const oneEth = ethers.BigNumber.from("1000000000000000000");

    const tx = {
      to: ETHPool.address,
      value: oneEth
    };

    await owner.sendTransaction(tx);
    
    await ETHPool.connect(owner).withdraw();
    
    const newBalance = await owner.getBalance();

    expect(newBalance).to.be.within(balance.sub(oneEth), balance); // gas costs deducted from original balance
  });

  it("Should not distribute rewards if pool is empty", async function () {
    const oneEth = ethers.BigNumber.from("1000000000000000000");

    await expect(ETHPool.connect(owner).depositRewards({ value : oneEth })).to.be.reverted;
  });
  

  it("Should allow depositing rewards from team member", async function () {
    const balance1 = await alice.getBalance();
    const balance2 = await bob.getBalance();

    const tenEth = ethers.BigNumber.from("10000000000000000000");
    const twentyEth = ethers.BigNumber.from("20000000000000000000");
    const thirtyEth = ethers.BigNumber.from("30000000000000000000");

    const fiveEth = ethers.BigNumber.from("5000000000000000000");
    const fifteenEth = ethers.BigNumber.from("15000000000000000000");
    
    let tx1 = {
      to: ETHPool.address,
      value: tenEth
    };
  
    let tx2 = {
      to: ETHPool.address,
      value: thirtyEth
    };
  
    await alice.sendTransaction(tx1);
    await bob.sendTransaction(tx2);

    await ETHPool.connect(owner).depositRewards({ value : twentyEth });

    await ETHPool.connect(alice).withdraw();
    await ETHPool.connect(bob).withdraw();

    const newBalance1 = await alice.getBalance();
    const newBalance2 = await bob.getBalance();
    
    expect(newBalance1).to.be.within(balance1, balance1.add(fiveEth)); // Original Balance + 50 ethers
    expect(newBalance2).to.be.within(balance2, balance2.add(fifteenEth)); // Original Balance + 150 ethers
  });

  it("Should only distribute rewards for users in pool", async function () {
    const balance1 = await alice.getBalance();
    const balance2 = await bob.getBalance();

    const oneEth = ethers.BigNumber.from("1000000000000000000");
    const tenEth = ethers.BigNumber.from("10000000000000000000");
    const twentyEth = ethers.BigNumber.from("20000000000000000000");
    const thirtyEth = ethers.BigNumber.from("30000000000000000000");

    const fiveEth = ethers.BigNumber.from("50000000000000000000");
    const fifteenEth = ethers.BigNumber.from("150000000000000000000");
    
    let tx1 = {
      to: ETHPool.address,
      value: tenEth
    };
  
    let tx2 = {
      to: ETHPool.address,
      value: thirtyEth
    };
  
    await alice.sendTransaction(tx1);
    await bob.sendTransaction(tx2);

    await ETHPool.connect(alice).withdraw();

    // it should only send rewards to bob
    await ETHPool.connect(owner).depositRewards({ value : twentyEth });
    
    await ETHPool.connect(bob).withdraw();

    const newBalance1 = await alice.getBalance();
    const newBalance2 = await bob.getBalance();
    
    expect(newBalance1).to.be.within(balance1.sub(oneEth), balance1); // Original Balance - gas
    expect(newBalance2).to.be.within(balance2, balance2.add(twentyEth)); // Original Balance + 200 ethers
  });

  it("Should distribute rewards to single user in pool", async function () {
    const balance1 = await alice.getBalance();

    const tenEth = ethers.BigNumber.from("10000000000000000000");
    const twentyEth = ethers.BigNumber.from("20000000000000000000");
    const thirtyEth = ethers.BigNumber.from("30000000000000000000");
    
    let tx1 = {
      to: ETHPool.address,
      value: tenEth
    };
  
    let tx2 = {
      to: ETHPool.address,
      value: thirtyEth
    };
  
    await alice.sendTransaction(tx1);
    await alice.sendTransaction(tx2);

    await ETHPool.connect(owner).depositRewards({ value : twentyEth });
    
    await ETHPool.connect(alice).withdraw();

    const newBalance1 = await alice.getBalance();
    
    expect(newBalance1).to.be.within(balance1, balance1.add(twentyEth)); // Original Balance + 200 ethers
  });

  it("Should add and remove team member", async function () {
    
    const txAdd = await (await ETHPool.addTeamMember(alice.address)).wait();
    const txRemove = await (await ETHPool.removeTeamMember(alice.address)).wait();
    
    expect(txAdd.events?.filter((x) => {return x.event == "RoleGranted"})).to.not.be.null;
    expect(txRemove.events?.filter((x) => {return x.event == "RoleRevoked"})).to.not.be.null;
  });
});
