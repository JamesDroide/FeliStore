const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Felicoin", function () {
  let felicoin;
  let owner;
  let addr1;

  beforeEach(async function () {
    [owner, addr1] = await ethers.getSigners();
    const initialSupply = ethers.parseUnits("1000000", 18);
    const Felicoin = await ethers.getContractFactory("Felicoin");
    felicoin = await Felicoin.deploy(initialSupply);
    await felicoin.waitForDeployment();
  });

  it("Should set the right owner", async function () {
    expect(await felicoin.owner()).to.equal(owner.address);
  });

  it("Should assign the initial supply to the owner", async function () {
    const ownerBalance = await felicoin.balanceOf(owner.address);
    expect(await felicoin.totalSupply()).to.equal(ownerBalance);
  });
});
