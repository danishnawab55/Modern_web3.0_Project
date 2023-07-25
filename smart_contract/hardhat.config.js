// https://eth-goerli.g.alchemy.com/v2/2iW2i5NL1dHSnC_tg8eS8bwnjnreMoL0
require('@nomiclabs/hardhat-waffle');

module.exports = {
  solidity: '0.8.0',
  networks: {
    ropsten: {
      url: 'https://eth-goerli.g.alchemy.com/v2/2iW2i5NL1dHSnC_tg8eS8bwnjnreMoL0',
      accounts: ['bbf4b47a1f35f9b37f116adf3d19be9573d6524a8a5204625f8673925781f4ba'],
    },
  },
};