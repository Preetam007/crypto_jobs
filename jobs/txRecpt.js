const request = require('request');
require('dotenv').config();
const Web3 = require('web3');
const web3 = new Web3(new Web3.providers.HttpProvider(`https://mainnet.infura.io/${process.env.INFURA_ACCESS_TOKEN}`));
const internalTrxnUrl = 'https://api.etherscan.io/api?module=account&action=txlistinternal&txhash=%trxnHash%&apikey=QZT28CGN1B29ENZTMDUKENIYBCJ9PWIZ87';
const THE_ADDRESS = process.env.CONTRACT_ADDRESS;
const TOKEN_ADDRESS = process.env.TOKEN_ADDRESS;
// const logger = require('config/logger');
// const config_crypto = require('config/config-crypto');
// const network = config_crypto.getNetwork();


console.log('coming');
const receipt = web3.eth.getTransactionReceipt('0x029748e93c5fb751965a6fa33935e9ff0b6c7fde9813a73347de5646692b50e5', (err3, data) => {
  console.log(err3);
  console.log(data);
});