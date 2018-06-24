'use strict';
const Web3 = require('web3');
const fs = require('fs');
require('dotenv').config();

const web3 = new Web3(new Web3.providers.HttpProvider(`https://ropsten.infura.io/${process.env.INFURA_ACCESS_TOKEN}`));
const obj = JSON.parse(fs.readFileSync('../build/contracts/token.json', 'utf8'));
const abiArray = obj;
const contractAddress = process.env.CONTRACT_ADDRESS;
const tokenAddress =    process.env.TOKEN_ADDRESS;
const crowdsaleContract = new web3.eth.Contract(abiArray, contractAddress);
const tokenContract = new web3.eth.Contract(abiArray, tokenAddress);

// https://api-ropsten.etherscan.io/api?module=transaction&action=gettxreceiptstatus&txhash=0x77283690ccce4fd2aebf5387a8f684252929f965c86a6c34bb75991cffdb82c0&apikey=QZT28CGN1B29ENZTMDUKENIYBCJ9PWIZ87

var receipt = web3.eth.getTransactionReceipt('0x77283690ccce4fd2aebf5387a8f684252929f965c86a6c34bb75991cffdb82c0', function name(err, data) {

  console.log(err, data);

  // if data.status: '0x1' --> means transaction is correct .
  // check internal transaction (to check ether sent )
  // https: //api-ropsten.etherscan.io/api?module=account&action=txlistinternal&txhash=0x77283690ccce4fd2aebf5387a8f684252929f965c86a6c34bb75991cffdb82c0&apikey=QZT28CGN1B29ENZTMDUKENIYBCJ9PWIZ87
  // output would be like 
  // // {
  //   "message": "OK",
  //   "result": [{
  //     "blockNumber": "3495297",
  //     "contractAddress": "",
  //     "errCode": "",
  //     "from": "0xbce0532e131e74efcb750b867af31efd161bd22f",
  //     "gas": "2300",
  //     "gasUsed": "0",
  //     "input": "",
  //     "isError": "0",
  //     "timeStamp": "1529767060",
  //     "to": "0xa9ee36ba5bbe5c3e7c8770e1427421fa00badd82",
  //     "type": "call",
  //     "value": "1000000000000000000"   // this is amount of ether (divide it by 10 power 18) = 1;
  //   }],
  //   "status": "1"
  // }
  // so check value should be equal to user amount in our db
  // after that check in logs array of getTransactionReceipt and in object if address == 'token address'
  // thn in topics array check topics[0] == '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef'
  // thn decode that log

  console.log(web3.eth.abi.decodeLog([{
      type: 'address',
      name: 'from',
      indexed: true
    }, {
      type: 'address',
      name: 'to',
      indexed: true
    }, {
      type: 'uint256',
      name: 'value',
      indexed: true
    }],
    // this big hash is logsBloom key
    '0x00000000000000000000000000000000200000004000000040000000000000001000000000000000000000000000000000000000000000000000000000200000000000000000000000000008000000000000000000000000080000000000000000800000400000000000000000000000000000000000000000000010000000040000000000000000000000000000000000000000000000000010000020000000000000002000000000000000000000000000000000000000800000000000000000000002000400000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000020000000000000000000', [
      '0x000000000000000000000000bce0532e131e74efcb750b867af31efd161bd22f', // this is topics[1]
      '0x000000000000000000000000a9ee36ba5bbe5c3e7c8770e1427421fa00badd82', // this is topics[2]
      '000000000000000000000000000000000000000000000355eae9de53c1200000',   // this is logs.data
    ]));

    // now check in console for value , divide by 18 
    // this is no of tokens transferred in that transaction 

    // check in db for that transaction and compare with user tokens , if equal update token transfer status to true
    

  
});

console.log(web3.eth.abi.encodeEventSignature('Transfer(address, address, uint256)'));
// 0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef


//https: //api-ropsten.etherscan.io/api?module=account&action=txlistinternal&txhash=0x77283690ccce4fd2aebf5387a8f684252929f965c86a6c34bb75991cffdb82c0&apikey=QZT28CGN1B29ENZTMDUKENIYBCJ9PWIZ87



// https://api-ropsten.etherscan.io/api?module=account&action=tokentx&contractaddress=0x54F5C2a2F8D191345cF5445807dd76EB6A421950&address=0xbce0532e131e74efcb750b867af31efd161bd22f&page=1&offset=100&sort=asc&apikey=QZT28CGN1B29ENZTMDUKENIYBCJ9PWIZ87




// {
//   "message": "OK",
//   "result": [{
//       "blockHash": "0xb85c54fcb8f35f94a9720a9b87cde5ece452495bbd179aa3764ba5afbb06f57f",
//       "blockNumber": "3495275",
//       "confirmations": "3413",
//       "contractAddress": "0x54f5c2a2f8d191345cf5445807dd76eb6a421950",
//       "cumulativeGasUsed": "3660187",
//       "from": "0x54f5c2a2f8d191345cf5445807dd76eb6a421950",
//       "gas": "75402",
//       "gasPrice": "1000000000",
//       "gasUsed": "75402",
//       "hash": "0xae091a263a99ecd22f7116338b7675d43abfdac6e5cc16f60badffee3f60bac0",
//       "input": "0xfdd080a4000000000000000000000000bce0532e131e74efcb750b867af31efd161bd22f",
//       "nonce": "27",
//       "timeStamp": "1529766853",
//       "to": "0xbce0532e131e74efcb750b867af31efd161bd22f",
//       "tokenDecimal": "18",
//       "tokenName": "IDAPT",
//       "tokenSymbol": "IDAP",
//       "transactionIndex": "10",
//       "value": "750000000000000000000000000"
//     },
//     {
//       "blockHash": "0xa4212dece44dab28e4d4d9492820073046c0febffe2118fea65f066045d79df5",
//       "blockNumber": "3495297",
//       "confirmations": "3391",
//       "contractAddress": "0x54f5c2a2f8d191345cf5445807dd76eb6a421950",
//       "cumulativeGasUsed": "815218",
//       "from": "0xbce0532e131e74efcb750b867af31efd161bd22f",
//       "gas": "165186",
//       "gasPrice": "1000000000",
//       "gasUsed": "107882",
//       "hash": "0x77283690ccce4fd2aebf5387a8f684252929f965c86a6c34bb75991cffdb82c0",
//       "input": "0x",
//       "nonce": "1",
//       "timeStamp": "1529767060",
//       "to": "0xa9ee36ba5bbe5c3e7c8770e1427421fa00badd82",
//       "tokenDecimal": "18",
//       "tokenName": "IDAPT",
//       "tokenSymbol": "IDAP",
//       "transactionIndex": "8",
//       "value": "15752000000000000000000"
//     }
//   ],
//   "status": "1"
// }
