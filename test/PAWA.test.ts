import { ethers } from "hardhat";
import { expect } from "chai";
import { PAWA } from "../typechain-types";
import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";

describe("PAWA", function () {
    let pawa: PAWA;
    let owner: SignerWithAddress;
    let addr1: SignerWithAddress;

    const expectedInitialSupply = BigInt(ethers.parseUnits("21000", 18).toString()); // Define the expected initial supply

    beforeEach(async function () {
        const PAWAFactory = await ethers.getContractFactory("PAWA");
        [owner, addr1] = await ethers.getSigners();
        pawa = await PAWAFactory.deploy() as PAWA;
    });

    describe("Deployment", function () {
        it("Should have the correct name and symbol", async function () {
            expect(await pawa.name()).to.equal("PAWA");
            expect(await pawa.symbol()).to.equal("PAWA");
        });

        it("Should assign the initial supply of tokens to the owner", async function () {
            const ownerBalance = BigInt(await pawa.balanceOf(owner.address).then(bn => bn.toString()));
            expect(ownerBalance).to.equal(expectedInitialSupply);
        });
    });

    describe("Burning", function () {
        it("Should allow users to burn their tokens", async function () {
            const burnAmount = BigInt(ethers.parseUnits("1000", 18).toString());
            await pawa.burn(burnAmount);

            const finalBalance = BigInt(await pawa.balanceOf(owner.address).then(bn => bn.toString()));
            const expectedBalance = expectedInitialSupply - burnAmount; // Directly use the expected initial supply
            expect(finalBalance).to.equal(expectedBalance);
        });

        it("Should fail to burn more tokens than the account holds", async function () {
            const burnAmount = expectedInitialSupply + BigInt(1); // Exceeding the total supply
            await expect(pawa.connect(owner).burn(burnAmount)).to.be.reverted;
        });
    });

    describe("Transfer Functionality", function () {
        it("Should transfer tokens between accounts", async function () {
            const transferAmount = BigInt(ethers.parseUnits("1000", 18).toString());
            await pawa.transfer(addr1.address, transferAmount);

            const addr1Balance = BigInt((await pawa.balanceOf(addr1.address)).toString());
            expect(addr1Balance).to.equal(transferAmount);
        });

        it("Should emit Transfer event when tokens are transferred", async function () {
            const transferAmount = BigInt(ethers.parseUnits("1000", 18).toString());
            await expect(pawa.transfer(addr1.address, transferAmount))
                .to.emit(pawa, "Transfer")
                .withArgs(owner.address, addr1.address, transferAmount);
        });
    });

    describe("Approval and Allowance", function () {
        it("Should correctly set allowance", async function () {
        const allowanceAmount = BigInt(ethers.parseUnits("500", 18).toString());
        await pawa.approve(addr1.address, allowanceAmount);

        const allowance = BigInt((await pawa.allowance(owner.address, addr1.address)).toString());
        expect(allowance).to.equal(allowanceAmount);
        });

        it("Should transfer tokens using transferFrom", async function () {
        const transferAmount = BigInt(ethers.parseUnits("300", 18).toString());
        await pawa.approve(addr1.address, transferAmount);
        await pawa.connect(addr1).transferFrom(owner.address, addr1.address, transferAmount);

        const addr1Balance = BigInt((await pawa.balanceOf(addr1.address)).toString());
        expect(addr1Balance).to.equal(transferAmount);
        });

        it("Should revert when trying to transfer more than the allowance", async function () {
            const allowanceAmount = BigInt(ethers.parseUnits("500", 18).toString());
            await pawa.approve(addr1.address, allowanceAmount);
            const transferAmount = allowanceAmount + BigInt(1);
            await expect(pawa.connect(addr1).transferFrom(owner.address, addr1.address, transferAmount))
                .to.be.reverted;
        });
        
        it("Should reset the allowance when it's set to zero", async function () {
            const allowanceAmount = BigInt(ethers.parseUnits("500", 18).toString());
            await pawa.approve(addr1.address, allowanceAmount);
            await pawa.approve(addr1.address, 0);
            const currentAllowance = await pawa.allowance(owner.address, addr1.address).then(bn => bn.toString());
            expect(BigInt(currentAllowance)).to.equal(0);
        });
        
    });

    // Testing edge cases
    describe("Edge Cases", function () {
        it("Should handle transferring zero tokens", async function () {
            const transferAmount = BigInt(0); // Zero tokens
            await expect(pawa.transfer(addr1.address, transferAmount))
              .to.emit(pawa, 'Transfer')
              .withArgs(owner.address, addr1.address, transferAmount);
            
            const addr1Balance = BigInt((await pawa.balanceOf(addr1.address)).toString());
            expect(addr1Balance).to.equal(transferAmount);
        });

        it("Should handle burning zero tokens", async function () {
            const burnAmount = BigInt(0); // Zero tokens
            await expect(pawa.burn(burnAmount)).to.not.be.reverted;
            
            const finalBalance = BigInt((await pawa.balanceOf(owner.address)).toString());
            const expectedBalance = BigInt(ethers.parseUnits("21000", 18).toString()); // No change expected
            expect(finalBalance).to.equal(expectedBalance);
        });

        it("Should revert when trying to transfer tokens to the zero address", async function () {
            const transferAmount = BigInt(ethers.parseUnits("1000", 18).toString());
            await expect(pawa.transfer(ethers.ZeroAddress, transferAmount))
                .to.be.reverted;
        });
        
        it("Should not change the balance when burning zero tokens", async function () {
            await pawa.burn(0);
            const finalBalance = await pawa.balanceOf(owner.address).then(bn => bn.toString());
            expect(BigInt(finalBalance)).to.equal(expectedInitialSupply);
        });
        
    });

});

