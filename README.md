# Pareto Network Token ERC20 Contract

## Warning! Don't forget to change wallet address in migrations: `migrations/4_CrowdSale.js`. This wallet will be user to receive ether  

## The project based on OpenZeppelin smart contract added into repository (OpenZeppelin 1.3.0)

## Install project dependencies
1. Install nodejs and npm
2. Install project dependencies: `npm install`

## Run testrpc (do it in a separate bash session)
`npm run testrpc`   

## Compile smart contracts
`npm run compile`  

## Run full test suite
`npm run tests`  

## Run specified test
`npm run test ./test/1_ParetoNetworkToken.js`

## Generate test coverage report
`npm run coverage`     

## Run Solium linter
`./node_modules/.bin/solium --dir ./contracts`  

## Reformat the code according to Solium rules
`./node_modules/.bin/solium --dir ./contracts --fix`  

## Run solcheck linter
`./node_modules/.bin/solcheck contracts/*`

## Run all linters in project
`npm run lint`  

## Build and deploy smart contract into network
`./node_modules/.bin/truffle migrate`

## Deploy smart contract into live network
`./node_modules/.bin/truffle migrate --network live`

## Redeploy all contracts
`./node_modules/.bin/truffle migrate --reset`  

## Software versions
Solidity v0.4.18  
Truffle v4.0.1  
testrpc v6.0.1  
OpenZeppelin 1.3.0  
solidity-coverage 0.2.5  
Solium linter 1.0.0 BETA  
solcheck linter 0.1.3  

## Test coverage report
`coverage/index.html`
