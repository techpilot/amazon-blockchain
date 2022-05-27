const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("AmazonCoin", function () {
  it("Should return the new greeting once it's changed", async function () {
    const AmazonCoin = await ethers.getContractFactory("AmazonCoin");
    const amazon = await AmazonCoin.deploy();
    await amazon.deployed();

    // expect(await amazon.greet()).to.equal("Hello, world!");

    // const setGreetingTx = await amazon.setGreeting("Hola, mundo!");

    // wait until the transaction is mined
    // await setGreetingTx.wait();

    // expect(await greeter.greet()).to.equal("Hola, mundo!");
  });
});
