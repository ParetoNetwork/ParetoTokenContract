const ParetoNetworkToken = artifacts.require('ParetoNetworkToken.sol');
const PricingStrategy = artifacts.require('PricingStrategy.sol');
const CrowdSale = artifacts.require('CrowdSale.sol');

module.exports = async function (deployer) {
    //todo change wallet address. Currently wallet is tokens owner address
    const wallet = "0x3a0b31e77f1d608ab0497a259f7bf8a8417f83ff";

    await deployer.deploy(CrowdSale,
        ParetoNetworkToken.address,
        PricingStrategy.address,
        wallet
    );

    const crowdSaleInstance = await CrowdSale.deployed();
    const tokensToApprove = await crowdSaleInstance.TOKEN_TOTAL_PURCHASE_CAP();

    const tokenInstance = await ParetoNetworkToken.deployed();
    //Approve owner tokens for transfer by CrowdSale
    await tokenInstance.approve(CrowdSale.address, tokensToApprove);
};
