const ParetoNetworkToken = artifacts.require('ParetoNetworkToken.sol');
const CrowdSale = artifacts.require('CrowdSale.sol');

module.exports = async function (deployer) {
    deployer.deploy(ParetoNetworkToken);
    deployer.link(ParetoNetworkToken, CrowdSale);
};
