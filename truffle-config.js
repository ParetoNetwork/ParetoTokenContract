require('babel-register');
require('babel-polyfill');

module.exports = {
    networks: {
        development: {
            host: "localhost",
            port: 8545,
            network_id: "*"
        },
        test: {
            host: "localhost",
            port: 8444,
            network_id: "*",
            gas: 0xfffffffffff,
            gasPrice: 0x01
        },
        coverage: {
            host: "localhost",
            network_id: "*",
            port: 8555,
            gas: 0xfffffffffff,
            gasPrice: 0x01
        },
        live: {
            network_id: 1,
            host: "localhost",
            port: 8545,
            /**
             * From address should be changed
             */
            from: "0x3a0b31e77f1d608ab0497a259f7bf8a8417f83ff",
            /**
             * Current default gas price.
             * Minimal could be 100000000 wei (confirm one transaction for 3 minutes)
             */
            gasPrice: "21000000000"
        }
    }
};
