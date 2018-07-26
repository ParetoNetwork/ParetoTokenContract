const BigNumber = web3.BigNumber;

require('chai')
    .use(require('chai-as-promised'))
    .use(require('chai-bignumber')(BigNumber))
    .should();

import EVMRevert from './helpers/EVMRevert'
import ether from './helpers/ether';

const PricingStrategy = artifacts.require('PricingStrategy.sol');

async function deployStrategy() {
    return PricingStrategy.new();
}

contract('PricingStrategy', function ([owner, nonOwner]) {
    let instance;

    const tokenDecimals = 18;

    const defaultTokenPrice = ether(1).divToInt(1224);
    const bonusTokenPrice = ether(1).divToInt(1700);

    beforeEach(async () => {
        instance = await deployStrategy();
        assert.ok(instance);
    });

    it('Check that bonus price is set by default', async function () {
        const currentPrice = await instance.oneTokenInWei();
        currentPrice.should.be.bignumber.equal(bonusTokenPrice);
    });

    it('Check bonus and default prices', async function () {
        await instance.switchToDefaultPrice();
        const expectedDefaultPrice = await instance.oneTokenInWei();
        expectedDefaultPrice.should.be.bignumber.equal(defaultTokenPrice);

        await instance.switchToBonusPrice();
        const expectedBonusPrice = await instance.oneTokenInWei();
        expectedBonusPrice.should.be.bignumber.equal(bonusTokenPrice);
    });

    it('Check calculation of price', async function () {
        const expectedTokensReceived = web3.toBigNumber('1e18');

        /** One token received with 18 decimals */
        (await instance.calculateTokenAmount(bonusTokenPrice, tokenDecimals))
            .should.be.bignumber.equal(expectedTokensReceived);

        await instance.switchToDefaultPrice();

        /** One token received with 18 decimals */
        (await instance.calculateTokenAmount(defaultTokenPrice, tokenDecimals))
            .should.be.bignumber.equal(expectedTokensReceived);
    });

    it('Get exception when trying to switch prices by non-owner', async function () {
        await instance.switchToDefaultPrice({from: nonOwner}).should.be.rejectedWith(EVMRevert);
        await instance.switchToBonusPrice({from: nonOwner}).should.be.rejectedWith(EVMRevert);
    });

    it('Check pricing strategy interface', async function () {
        (await instance.isPricingStrategy()).should.be.equal(true);
    })
});
