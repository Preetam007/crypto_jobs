'use strict';
const schedule = require('node-schedule'),
  request = require('request'),
  logger = require('config/logger'),
  trxnModel = require('./../app/v1/modules/transaction/model'),
  trxnDoa = require('./../app/v1/modules/transaction/doa'),
  userModel = require('./../app/v1/modules/user/model');

const Web3 = require('web3');
const fs = require('fs');
//require('dotenv').config();
const web3 = new Web3(new Web3.providers.HttpProvider(`https://ropsten.infura.io/${process.env.INFURA_ACCESS_TOKEN}`));
const internalTrxnUrl = 'https://api-ropsten.etherscan.io/api?module=account&action=txlistinternal&txhash=%trxnHash%&apikey=QZT28CGN1B29ENZTMDUKENIYBCJ9PWIZ87'
const THE_ADDRESS = '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef';

//const obj = JSON.parse(fs.readFileSync('../build/contracts/token.json', 'utf8'));
//const abiArray = obj;
const contractAddress = process.env.CONTRACT_ADDRESS;
const tokenAddress =    process.env.TOKEN_ADDRESS;
//const crowdsaleContract = new web3.eth.Contract(abiArray, contractAddress);
//const tokenContract = new web3.eth.Contract(abiArray, tokenAddress);

const service = schedule.scheduleJob('*/1 * * * *', function () {
  console.log('The answer to life, the universe, and everything!');
});

var trxnStream = trxnModel.find({ status: 'pending' }).stream();

trxnStream.on('data', function (pendingTrxn) {
  if (!pendingTrxn) {
    return false;
  }

  checkIfValid(pendingTrxn.transactionHash,(err,result)=>{
    if (err) {
      return logger.error('Invalid Trxn');
    } else {
      checkIntTrxn(pendingTrxn,result,(Int_err,Int_valid_result)=>{
        if (Int_err) {
          return logger.error('Amount of token does not match');
        } else {
          logger.info('success till now');
          var data = {
            $set : { status : 'confirmed' }
          }
          trxnDoa.findByIdAndUpdate({id:pendingTrxn._id,data});

          var decodedData = decodeLog(Int_valid_result)
          logger.info(decodedData);
        }
      });
    }

  });
  
  //checkvalidity
  //ifokupdateusertokens
  //console.log(pendingTrxn);
});

trxnStream.on('error', function (err) {
  // handle err
});

trxnStream.on('close', function () {
  logger.info('all done. Stream Closed.')
});



var checkIfValid = function (trxnHash,cb) {
  var receipt = web3.eth.getTransactionReceipt(trxnHash, function name(err, data) {

    logger.log(err, data);
    if (err) {
      cb(true, data);
    } else if ( data && data.status === '0x1') {
      cb(false, data);
    } else {
      cb(true, data);
    }

  });
}

var checkIntTrxn =  function (pendingTrxn,validResult,cb) {

  request.get({ uri: internalTrxnUrl.replace('%trxnHash%', pendingTrxn.transactionHash) }, (err, res, body) => {
    const ResBody = body ? JSON.parse(body) : {};
    if (err) {
      logger.error(err);
      return cb(true,validResult);
    } else if(ResBody.message !== "OK") {
      return cb(true,validResult);
    } else {
      let ethAmount = ResBody.result[0].value / Math.pow(10,18);
      if(ethAmount == pendingTrxn.amount){
        return cb(false,validResult);
      } else {
        return cb(true,validResult);
      }
    }

    //console.log(body);
  })
}

var decodeLog = function (data) {
  let logsBloom,topics1,topics2,logsData;
  logsBloom = data.logsBloom;
  for (let index = 0; index < data.logs.length; index++) {
    const element = data.logs[index];
    if (element.address === THE_ADDRESS) {
      topics1 = element.topics[1];
      topics2 = element.topics[2];
      logsData = element.data;
      break;
    }
  }

  //const logsBloom,topics1,topics2,logsData;
  return web3.eth.abi.decodeLog([{
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
  logsBloom, [
    topics1, // this is topics[1]
    topics2, // this is topics[2]
    logsData,   // this is logs.data
  ])
}

module.exports = service;