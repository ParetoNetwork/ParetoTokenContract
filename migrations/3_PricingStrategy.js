const PricingStrategy = artifacts.require('PricingStrategy.sol');
const CrowdSale = artifacts.require('CrowdSale.sol');

module.exports = async function (deployer) {
    deployer.deploy(PricingStrategy);
    deployer.link(PricingStrategy, CrowdSale);
};
