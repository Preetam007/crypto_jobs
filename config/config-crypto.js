var config = {
  hashKey: "Aka@!@#0**",
  testnet: {
    mongoDb: {
      uri: 'mongodb://localhost/idap'
    },
    provider:"https://ropsten.infura.io/",
    eth_url: "http://ropsten.etherscan.io/",
    btc_url: "https://test-insight.bitpay.com/",
    eth_api_url: "http://api-ropsten.etherscan.io/",
    btc_api_url: "https://test-insight.bitpay.com/api/",
    contract: "",
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
    contract: "",
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
  if (process.env.NODE_ENV == 'production') {
    return 'livenet';
  } else return 'testnet';
}

module.exports = config;