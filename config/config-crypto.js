var config = {
  hashKey: "#####",
  testnet: {
    mongoDb: {
      uri: 'mongodb://localhost/jobs'
    },
    provider:"https://ropsten.infura.io/",
    eth_url: "http://ropsten.etherscan.io/",
    btc_url: "https://test-insight.bitpay.com/",
    eth_api_url: "http://api-ropsten.etherscan.io/",
    btc_api_url: "https://test-insight.bitpay.com/api/",
    btc_blockcypher_api_url: "https://api.blockcypher.com/v1/btc/test3/",
    //@NOTE: need ?token=$YOUR_TOKEN' for blockcypher faucet
    btc_blockcypher_test_faucet_api_url: "https://api.blockcypher.com/v1/bcy/test",
    contractAddress: "0x4BCC39c2E1d107984DC510236e599ba48c504872",
    tokenAddress: "0x1aa800840f7524938bEDafa460997bA30ec4b235",
    bitcoinReceivingAddress: "3FtFgSVPPEqusZXhm26mXmTkZHuwCFeGTb",
    infuraToken: "zsCKGa1CjfJz8q6Fc5XI",
    relay_contract: "",
    pricingstrategy:"",
    gactoken:"", 
    mnemonic: '',
    eth_exchange_wallet: 'xpub6EnrhzLB9rYnZh1enhCzNuXALDqt6jdtrzf7URN7vZpVkRD9cJPXkvBU6ZjpeVLEuyLCdJCaWWGUwZKfhQPmbcB6svA3t5UE3gytiUw2uub', // testnet m/44'/1'/0'/0
    btc_wallet : 'tpubDFAVEE9rs8WEqVCWEtC5aprXfLwY688xQdFQpyRGGUaPVhsrgXEcuMrJLbpcAzHUhss7EsiT3c6XdjpH6GF1V3dPwWuMZc8TdeaJUWY5DQT'
  },
  livenet: {
    provider:"https://mainnet.infura.io/",
    eth_url: "http://etherscan.io/",
    btc_url: "https://insight.bitpay.com/",
    eth_api_url: "https://api.etherscan.io/api",
    btc_api_url: "https://insight.bitpay.com/api/",
    btc_blockcypher_api_url: "https://api.blockcypher.com/v1/btc/main/",
    contractAddress: "0x4BCC39c2E1d107984DC510236e599ba48c504872",
    tokenAddress: "0x1aa800840f7524938bEDafa460997bA30ec4b235",
    bitcoinReceivingAddress: "3FtFgSVPPEqusZXhm26mXmTkZHuwCFeGTb",
    infuraToken: "zsCKGa1CjfJz8q6Fc5XI",
    relay_contract: "",
    pricingstrategy:"",
    gactoken:"", 
    mnemonic: "",
    eth_exchange_wallet: '',
    btc_wallet : ''
  },
  getNetwork: getNetwork
};

function getNetwork() {
  if (process.env.NODE_ENV == 'production' || process.env.NODE_ENV == 'staging') {
    return 'livenet';
  }
  else return 'livenet';
}

module.exports = config;