const BigNumber = web3.BigNumber;

require('chai')
    .use(require('chai-as-promised'))
    .use(require('chai-bignumber')(BigNumber))
    .should();

import EVMRevert from './helpers/EVMRevert'
import ether from './helpers/ether';

const ParetoNetworkToken = artifacts.require('ParetoNetworkToken.sol');
const PricingStrategy = artifacts.require('PricingStrategy.sol');
const CrowdSale = artifacts.require('CrowdSale.sol');

async function deployCrowdSaleTest(token, pricingStrategy, walletAddress) {
    return CrowdSale.new(token, pricingStrategy, walletAddress);
}

async function deployPricingStrategy(tokenPrice) {
    return PricingStrategy.new(tokenPrice)
}

async function deployToken() {
    return ParetoNetworkToken.new();
}

contract('CrowdSale', function ([owner, investor, wallet]) {
    let crowdSaleInstance;
    let tokenInstance;
    let pricingStrategyInstance;

    const tokenDecimals = 18;

    /** A total tokens cap for the CrowdSale. A 40% from the total issue (500m) with 18 token decimals */
    const TOKEN_TOTAL_PURCHASE_CAP = web3.toBigNumber('500000000').mul('0.40').mul('1e' + tokenDecimals);

    const defaultTokenPrice = ether(1).divToInt(1224);

    beforeEach(async () => {
        tokenInstance = await deployToken();
        pricingStrategyInstance = await deployPricingStrategy();

        crowdSaleInstance = await deployCrowdSaleTest(
            tokenInstance.address,
            pricingStrategyInstance.address,
            wallet
        );

        //Approve owner tokens
        const tokensToApprove = await crowdSaleInstance.TOKEN_TOTAL_PURCHASE_CAP();
        //Approve owner tokens for transfer by CrowdSale
        await tokenInstance.approve(crowdSaleInstance.address, tokensToApprove, {from: owner});

        assert.ok(crowdSaleInstance);
    });

    it('Check tokens total purchase cap', async function () {
        (await crowdSaleInstance.TOKEN_TOTAL_PURCHASE_CAP()).should.be.bignumber.equal(TOKEN_TOTAL_PURCHASE_CAP);
        (await crowdSaleInstance.getAvailableTokensToSell()).should.be.bignumber.equal(TOKEN_TOTAL_PURCHASE_CAP);
    });

    it('Invest tokens flow with via invest() method', async function () {
        //Will get 100 tokens for 1 ether
        const baseTokenAmount = await pricingStrategyInstance.calculateTokenAmount(defaultTokenPrice, tokenDecimals);
        const initialWalletBalance = web3.eth.getBalance(wallet);

        await crowdSaleInstance.invest({from: investor, value: defaultTokenPrice});

        //Allowed tokens to sell was decreased
        TOKEN_TOTAL_PURCHASE_CAP.minus(baseTokenAmount)
            .should.be.bignumber.equal(
            await crowdSaleInstance.getAvailableTokensToSell()
        );

        //Tokens was sent
        (await tokenInstance.balanceOf(investor)).should.be.bignumber.equal(
            baseTokenAmount
        );

        //Ether was received by wallet from the investor
        (await web3.eth.getBalance(wallet)).should.be.bignumber.equal(
            initialWalletBalance.add(defaultTokenPrice)
        );

        //Check crowdsale uuid public mappings
        (await crowdSaleInstance.tokenAmountOf(investor)).should.be.bignumber.equal(baseTokenAmount);
        (await crowdSaleInstance.investedAmountOf(investor)).should.be.bignumber.equal(defaultTokenPrice);
        (await crowdSaleInstance.tokensSold()).should.be.bignumber.equal(baseTokenAmount);
        (await crowdSaleInstance.weiRaised()).should.be.bignumber.equal(defaultTokenPrice);
        (await crowdSaleInstance.investorCount()).should.be.bignumber.equal(1);
    });

    it('Invest tokens flow with via fallback', async function () {
        //Will get 100 tokens for 1 ether
        const baseTokenAmount = await pricingStrategyInstance.calculateTokenAmount(defaultTokenPrice, tokenDecimals);
        const initialWalletBalance = web3.eth.getBalance(wallet);

        await web3.eth.sendTransaction(
            {from: investor, to: crowdSaleInstance.address, value: defaultTokenPrice, gas: 3000000}
        );

        //Allowed tokens to sell was decreased
        TOKEN_TOTAL_PURCHASE_CAP.minus(baseTokenAmount)
            .should.be.bignumber.equal(
            await crowdSaleInstance.getAvailableTokensToSell()
        );

        //Tokens was sent
        (await tokenInstance.balanceOf(investor)).should.be.bignumber.equal(
            baseTokenAmount
        );

        //Ether was received by wallet from the investor
        (await web3.eth.getBalance(wallet)).should.be.bignumber.equal(
            initialWalletBalance.add(defaultTokenPrice)
        );

        //Check crowdsale uuid public mappings
        (await crowdSaleInstance.tokenAmountOf(investor)).should.be.bignumber.equal(baseTokenAmount);
        (await crowdSaleInstance.investedAmountOf(investor)).should.be.bignumber.equal(defaultTokenPrice);
        (await crowdSaleInstance.tokensSold()).should.be.bignumber.equal(baseTokenAmount);
        (await crowdSaleInstance.weiRaised()).should.be.bignumber.equal(defaultTokenPrice);
        (await crowdSaleInstance.investorCount()).should.be.bignumber.equal(1);
    });

    it('Exception when trying to send zero ether', async function () {
        await crowdSaleInstance.invest({from: investor, value: 0}).should.be.rejectedWith(EVMRevert);
    });

    it('Set the new PricingStrategy', async function () {
        const newPricingStrategy = await deployPricingStrategy();
        await crowdSaleInstance.setPricingStrategy(newPricingStrategy.address, {from: owner}).should.be.fulfilled;
    });

    it('Exception when trying to set a non-PricingStrategy', async function () {
        await crowdSaleInstance.setPricingStrategy(investor, {from: owner}).should.be.rejectedWith(EVMRevert);
    });

    it('Exception when set the new PricingStrategy by the non-owner', async function () {
        const newPricingStrategy = await deployPricingStrategy();
        await crowdSaleInstance.setPricingStrategy(newPricingStrategy.address, {from: investor}).should.be.rejectedWith(EVMRevert)
    });

    it('Check finalize method', async function () {
        await crowdSaleInstance.finalize();
        (await crowdSaleInstance.finalizedTimestamp()).should.be.bignumber.not.equal(0);
        (await crowdSaleInstance.isFinalized()).should.be.equal(true);

        //Could not invest when finalized
        await crowdSaleInstance.invest({from: investor, value: defaultTokenPrice}).should.be.rejectedWith(EVMRevert);

        //Could not finalize twice
        await crowdSaleInstance.finalize().should.be.rejectedWith(EVMRevert);
    });

    it('Check pause flow', async function () {
        await crowdSaleInstance.pause();

        //Could not invest while paused
        await crowdSaleInstance.invest({from: investor, value: defaultTokenPrice}).should.be.rejectedWith(EVMRevert);

        await crowdSaleInstance.unpause();

        //Could invest white not paused
        await crowdSaleInstance.invest({from: investor, value: defaultTokenPrice}).should.be.fulfilled;
    });
});
