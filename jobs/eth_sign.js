const Web3 = require('web3')
const provider = new Web3.providers.HttpProvider('https://mainnet.infura.io/bcojZFdgTHPc8qdQGN3D');
const web3 = new Web3(provider)



// let addr = web3.eth.accounts[0]
// let msg = '[Etherscan.io 25/06/2018 14:57:45] I, hereby verify that the information provided is accurate and I am the owner/creator of the token contract address [0x940dfafc5a7c01b0c59f4d64b0afae350c7c6fb5]';
// let signature = web3.eth.sign('0x940dfafc5a7c01b0c59f4d64b0afae350c7c6fb5', '0x' + toHex(msg));
// console.log(signature)

web3.eth.sign("Hello world", "0x11f4d0A3c12e86B4b5F39B213F7E19D048276DAe",function(err,data){
  console.log(err);
  console.log(data);
});
 