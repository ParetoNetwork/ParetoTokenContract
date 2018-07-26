const BigNumber = web3.BigNumber;

require('chai')
    .use(require('chai-as-promised'))
    .use(require('chai-bignumber')(BigNumber))
    .should();

import EVMThrow from './helpers/EVMThrow'

const ParetoNetworkToken = artifacts.require('ParetoNetworkToken.sol');

const tokenName = 'Pareto Network Token';
const tokenSymbol = 'PXT';
const initialSupply = web3.toBigNumber('5e26');
const decimals = web3.toBigNumber('18');

async function deployToken() {
    return ParetoNetworkToken.new();
}

contract('ParetoNetworkToken', function (accounts) {
    let instance;

    const owner = accounts[0];

    beforeEach(async () => {
        instance = await deployToken();
        assert.ok(instance);
    });

    it('Check token properties', async function () {
        (await instance.totalSupply())
            .should.be.bignumber.equal(initialSupply);

        (await instance.decimals())
            .should.be.bignumber.equal(decimals);

        (await instance.name())
            .should.be.equal(tokenName);

        (await instance.symbol())
            .should.be.equal(tokenSymbol);
    });

    it('Check that tokens can be transfered', async function () {
            await instance.transfer(accounts[2], web3.toBigNumber('100'), {from: owner});
            const recipientBalance = await instance.balanceOf.call(accounts[2]);
            const senderBalance = await instance.balanceOf.call(owner);

            recipientBalance.should.be.bignumber.equal(web3.toBigNumber('100'));
            senderBalance.should.be.bignumber.equal(initialSupply.minus('100'));
    });

    it('Check that account can not transfer more tokens then have', async function () {
        try {
            await instance.transfer(accounts[2], 100, {from: owner});

            await instance.transfer(accounts[3], 102, {from: accounts[2]}).should.be.rejectedWith(EVMThrow);
        } catch (err) {
            assert(false, err.message)
        }
    });

    it('Check account balance', async function () {
        await instance.transfer(accounts[2], 100, {from: owner});
        const recipientBalance = await instance.balanceOf.call(accounts[2]);

        recipientBalance.should.be.bignumber.equal(100);
    });

    it('Check that account can transfer approved tokens', async function () {
        await instance.transfer(accounts[1], 100, {from: owner});
        await instance.approve(accounts[2], 50, {from: accounts[1]});
        await instance.transferFrom(accounts[1], accounts[3], 50, {from: accounts[2]});
        const recipientBalance = await instance.balanceOf.call(accounts[3]);

        recipientBalance.should.be.bignumber.equal(50);
    });

    it('Check that tokens can be approved', async function () {
        const tokensForApprove = 666;
        await instance.approve(accounts[3], tokensForApprove, {from: owner}).should.be.fulfilled;
    });

    it('Check balance of owner account', async function () {
        const balance = await instance.balanceOf.call(owner);
        balance.valueOf().should.be.bignumber.equal(initialSupply);
    });

    it('Check that account can not transfer unapproved tokens', async function () {
        const expectedBalance = 66;
        await instance.transferFrom(owner, accounts[2], expectedBalance, {from: accounts[1]}).should.be.rejectedWith(EVMThrow)
    });

    it('Check that approved tokens are allowed', async function () {
        const tokensForApprove = 666;
        await instance.approve(accounts[1], tokensForApprove, {from: owner});
        const allowed = await instance.allowance(owner, accounts[1]);
        allowed.should.be.bignumber.equal(tokensForApprove);
    });

    it('Check that account without approved tokens have zero allowed tokens', async function () {
        const allowed = await instance.allowance(owner, accounts[1]);
        allowed.should.be.bignumber.equal(0);
    });
});