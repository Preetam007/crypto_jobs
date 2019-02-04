const request = require('request');
const XLSX = require('xlsx');
const axios = require('axios');
require('dotenv').config();
const Web3 = require('web3');
const fs = require('fs');
// const coder = require('web3/lib/solidity/coder');
const CryptoJS = require('crypto-js');
const Tx = require('ethereumjs-tx');

/** Transaction confirmation config starts **/

// const web3 = new Web3(new Web3.providers.HttpProvider(`https://mainnet.infura.io/${process.env.INFURA_ACCESS_TOKEN}`));
// const internalTrxnUrl = 'https://api.etherscan.io/api?module=account&action=txlistinternal&txhash=%trxnHash%&apikey=QZT28CGN1B29ENZTMDUKENIYBCJ9PWIZ87';
// const THE_ADDRESS = process.env.CONTRACT_ADDRESS;
// const TOKEN_ADDRESS = process.env.TOKEN_ADDRESS;
// const logger = require('config/logger');
// const config_crypto = require('config/config-crypto');
// const network = config_crypto.getNetwork();

/** Transaction confirmation config ends **/


/** Token contract config starts **/

const web3 = new Web3(new Web3.providers.HttpProvider("https://mainnet.infura.io/########"));
const abiObj = JSON.parse(fs.readFileSync('build/contracts/transferContract.json', 'utf8'));
const abiArray = abiObj.abi;
// ico transfer contract address
const contractAddress = '0xbe99b09709fc753b09bcf557a992f6605d5997b0';
const contractReference = new web3.eth.Contract(abiArray, contractAddress);
// add account address
const account = '0x10EF807ff4cBCF3Bb8BC339Dc8Da06A23f38e92B';
// add private key
const myPrivateKey = '#######';
let privateKey = new Buffer(myPrivateKey, 'hex');


const functionName = 'transfer';
const types = ['address', 'uint256'];
const fullName = functionName + '(' + types.join() + ')';
const signature = CryptoJS.SHA3(fullName, {
  outputLength: 256
}).toString(CryptoJS.enc.Hex).slice(0, 8);

/** Token contract config ends **/




module.exports = function (agenda) {
  const modelFunction = require('../app/v1/modules/user/model');
  const txFUnction = require('../app/v1/modules/transaction/model');
  const tokenFunction = require('../app/v1/modules/tokens/model');

  agenda.define('update transaction status and token transfer status of ethereum', (job, done) => {
    txFUnction.count({
      'status': { $in : ['pending','halted','cancelled'] },
      'type': 'Ethereum'
    }, (err, count) => {
      if (err) {
        console.log(err.stack);
        return done(err);
      }

      console.log(count);
    
      const arr = [];

      if (count === 0) {
        return done(null, 'done updating transactions ---------------------------------------------------------');
      }

      const streams = txFUnction.find({
        'status': { $in : ['pending'] },
        'type': 'Ethereum'
      }, {}).limit(count).lean().stream();

      streams.on('data', (tx) => {
        //@TODO: check if error here
        /*
          need to pause for data processing   
        */
        streams.pause();
        arr.push(tx._id);
        streams.emit('checkIfValid transaction', tx);
      });

      streams.on('checkIfValid transaction', (tx) => {

        if (!tx.transactionHash) {
          console.log('tx hash is not given');
          streams.emit('update valid, invalid , failed , user entry wrong inputs trx', tx, 'cancelled');
        }
        else {
          console.log('coming');
          const receipt = web3.eth.getTransactionReceipt(tx.transactionHash, (err3, data) => {
            //console.log(data);
            if (err3) {
              streams.emit('final call', 'error in txhash getTransactionReceipt');
            } else if (data && data.status === '0x1') {

              if (data.from !== tx.fromAddress || data.to !== tx.toAddress) {
                console.log('update valid, invalid , failed , user entry wrong inputs trx 1');
                streams.emit('update valid, invalid , failed , user entry wrong inputs trx', tx, 'cancelled');
              } else {
                console.log('txhash confirmed on etherscan, get internal trxs');
                streams.emit('txhash confirmed on etherscan, get internal trxs', tx, data);
              }

            } else if (data && data.status === '0x0') {
              console.log('transaction declined on blockchain', tx.transactionHash);
              streams.emit('update valid, invalid , failed , user entry wrong inputs trx', tx, 'cancelled');
            } else {
              console.log('not yet mined');
              streams.emit('final call');
            }

          });
        }
      });


      streams.on('txhash confirmed on etherscan, get internal trxs', (tx, etherTx) => {
        console.log('internals');
        request.get({
          uri: internalTrxnUrl.replace('%trxnHash%', etherTx.transactionHash)
        }, (err1, res, body) => {
          const ResBody = body ? JSON.parse(body) : {};

          console.log('get internals');

          if (err1) {
            return streams.emit('final call', err1);
          } else if (ResBody.message !== 'OK' || ResBody.status !== '1') {
            console.log('error unexpected result , no documentation on etherscan');
            streams.emit('final call', 'unexpected result , no documentation on etherscan');
          } else {

            if (!!ResBody.result && ResBody.result[0].isError === '0') {
              console.log('all good , lets do this');
              //all good , lets do this
              const ethAmount = ResBody.result[0].value / Math.pow(10, 18);

              if (Math.round(ethAmount * 100) / 100 >= Math.round(tx.amount * 100) / 100) {
                console.log('we did it');
                streams.emit('update valid, invalid , failed , user entry wrong inputs trx', tx, 'confirmed', etherTx);
              } else {
                // mismatch  in values , lets halt this transaction for now
                console.log('mismatch  in values , lets halt this transaction for now');
                streams.emit('update valid, invalid , failed , user entry wrong inputs trx', tx, 'halted');
              }

            } else {
              // error in internal transaction
              streams.emit('final call', 'error in internal transaction');
            }
          }

        });

      });

      streams.on('update valid, invalid , failed , user entry wrong inputs trx', (tx, type, etherTxData) => {

        const updateObj = {
          'status': type
        };

        if (type === 'confirmed') {
          updateObj.tokensTransferred = 'yes';
          //@TODO: if with a trnasaction Hash a transaction is confirmed , than cancel this 

          txFUnction.findOne({
            transactionHash: tx.transactionHash,
            status : 'confirmed',
            userId: tx.userId
          }, (er, re) => {
              if (er) return streams.emit('final call', er);
              else if (!!re) {
                // got one transaction already confirmed with transaction hash , cancel this latest trxs
                console.log('got one transaction already confirmed with transaction hash , cancel this latest trxs');

                txFUnction.findByIdAndUpdate(tx._id, {
                  $set: { 'status' : 'cancelled' }
                }, (errs, res) => {

                  if (errs) {
                    //console.log(errs);
                    return streams.emit('final call', errs);
                  }

                  streams.emit('final call');
                  
                });
              }
              else  {
                console.log('transaction not already confirmed with transaction hash , confirm this latest trxs');
                txFUnction.findByIdAndUpdate(tx._id, {
                  $set: updateObj
                }, (errs, res) => {

                  if (errs) {
                    //console.log(errs);
                    return streams.emit('final call', errs);
                  }

                  // check no of tokens in a transaction .
                  streams.emit('check tokens transferred in a request and update tokens of user', tx, etherTxData);
                });
              }
          });

        }
        else {
          txFUnction.findByIdAndUpdate(tx._id, {
            $set: updateObj
          }, (errs, res) => {

            if (errs) {
              //console.log(errs);
              return streams.emit('final call', errs);
            }
            else {
              streams.emit('final call');
            }

          });
        }

      });

      streams.on('check tokens transferred in a request and update tokens of user', (tx, etherTxData) => {


        let logsBloom, topics1, topics2, logsData;
        logsBloom = etherTxData.logsBloom;

        for (let index = 0; index < etherTxData.logs.length; index++) {
          const element = etherTxData.logs[index];

          //@TODO: update before live
          // this is token address
          if (element.address === '0x1aa800840f7524938bEDafa460997bA30ec4b235') {
            console.log('matched');
            // topics[o] is signature of Transfer event function
            topics1 = element.topics[1];
            topics2 = element.topics[2];
            logsData = element.data;
          } else {
            console.log('none matcheed');
          }

        }

        console.log('about to decode log');

        try {
          const tokensAmount = web3.eth.abi.decodeLog([{
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
              logsData // this is logs.data
            ]).value / Math.pow(10, 18);

          console.log('decoded');

          console.log(tokensAmount);

          streams.emit('update user tokens in user schema', tx, tokensAmount);

          //streams.emit('final call');
        } catch (err3) {
          streams.emit('final call', 'error in decoding logs');
        }


      });

      streams.on('update user tokens in user schema', (tx, amount) => {
        const up = `tokens.${tx.phase}`;
        modelFunction.findByIdAndUpdate(tx.initiatedBy.id, {
          $inc: {
            [up]: parseInt(amount),
            'tokens.total': parseInt(amount)
          }
        }, (errs, res) => {

          if (errs) {
            return streams.emit('final call', 'update user tokens in user schema');
          }
          streams.emit('final call');

        });

      });

      streams.on('final call', (d) => {

        if (arr.length === count) {
          console.log('done all');
          done(null, 'done updating transactions ---------------------------------------------------------');
        } else {
          if(!!d) console.log(d);
          console.log('updating transactions-----------------keep patience--------------------------------');
          /*
            resume after processing data
          */
          streams.resume();
        }

      });

      streams.on('error', (err2) => {
        console.log('error catched');
       
        streams.resume();
      });

      streams.on('close', () => {
        // all done
        console.log('all done');
      });

    });
  });

  agenda.define('update transaction status and token transfer status of bitcoin', (job, done) => {
    txFUnction.count({
      'status': 'pending',
      'type': 'Bitcoin'
    }, (err, count) => {
      if (err) {
        console.log(err.stack);
        return done(err);
      }

      console.log(count);

      const arr = [];

      if (count === 0) {
        return done(null, 'done updating transactions ---------------------------------------------------------');
      }

      const streams = txFUnction.find({
        'status': 'pending',
        'type': 'Bitcoin'
      }, {}).limit(count).lean().stream();

      streams.on('data', (tx) => {
        //@TODO: check if error here
        /*
          need to pause for data processing   
        */
        streams.pause();

   
        arr.push(tx._id);
        streams.emit('checkIfValid transaction', tx);
      });

      streams.on('checkIfValid transaction', (tx) => {

        if (!tx.transactionHash) {
          return streams.emit('final call', 'tx hash is not given');
        }

        console.log('coming');


        request(config_crypto[[network]].btc_blockcypher_api_url + 'txs/' + tx.transactionHash, function (error, response, body) {

          if (!error && response && response.statusCode == 200) {
            var body_json = JSON.parse(body);

            //@TODO: 
            /*
             1. check in addresses array if toAddress and fromAddress Exists
             2. in outputs check toAddress and amount
            */

            streams.emit('check in addresses array if toAddress and fromAddress Exists', tx, body_json);
            
          } else {
            console.log('error in getting txs');
            streams.emit('final call', 'error in getting txs');
          }
        });


      });


      streams.on('check in addresses array if toAddress and fromAddress Exists', (tx, body_json) => {
         if (!!tx.fromAddress && body_json.addresses.map(function (x) {
             return x.toLowerCase();
           }).indexOf(tx.fromAddress.toLowerCase()) >= 0 /* && body_json.addresses.indexOf(tx.toAddress) >= 0 */ ) {
          console.log('found transaction in address array');
          streams.emit('in outputs check toAddress and amount', tx, body_json);
         }
         else {
           console.log('transaction not found in address array');
           streams.emit('final call', 'transaction not found in address array');
         }
      });


      streams.on('in outputs check toAddress and amount', (tx, body_json) => {

        let toAddress,
              explorerAmount,
              txAmount = tx.amount;
      
        body_json.outputs.forEach(element => {
          if (element.addresses.indexOf(tx.toAddress) != -1) {
            toAddress = tx.toAddress;
            console.log('to addresss found');
            explorerAmount = element.value / Math.pow(10, 8);
          }
        });

        if (toAddress && explorerAmount >= txAmount) {
          console.log('agreed on amount');
          streams.emit('final call', 'agreed on amount');
        } else {
          console.log('mismatch on amount');
          //@TODO: should be cancel this transaction
          streams.emit('final call', 'mismatch in values');
        }
      });



      streams.on('update valid, invalid , failed , user entry wrong inputs trx', (tx, type, etherTxData) => {

        const updateObj = {
          'status': type
        };


        txFUnction.findByIdAndUpdate(tx._id, {
          $set: updateObj
        }, (errs, res) => {

          if (errs) {
            console.log(errs);
            return streams.emit('final call', errs);
          }

          streams.emit('final call','everything done');
          
        });

      });



      streams.on('final call', () => {

        if (arr.length === count) {
          console.log('done all');
          done(null, 'done updating transactions ---------------------------------------------------------');
        } else {
          console.log('updating transactions-----------------keep patience--------------------------------');
          /*
            resume after processing data
          */
          streams.resume();
        }

      });

      streams.on('error', (err2) => {
        console.log('error catched');
        console.log(err2);
        streams.resume();
      });

      streams.on('close', () => {
        // all done
        console.log('all done');
      });

    });
  });


  agenda.define('transfer tokens to users',(job, done) => {

    tokenFunction.count({
      'status': 'pending',
    }, (err, count) => {
      if (err) {
        console.log(err.stack);
        return done(err);
      }

      console.log(count);

      const arr = [];

      if (count === 0) {
        return done(null, 'done updating transactions ---------------------------------------------------------');
      }

      const streams = tokenFunction.find({
        'status': 'pending'
      }, {}).limit(1).lean().stream();

      streams.on('data', (tx) => {
        //@TODO: check if error here
        /*
          need to pause for data processing   
        */
        streams.pause();

        console.log(tx);
        arr.push(tx._id);
        //@TODO: check available wei
        /*
        let myBalanceWei = web3.eth.getBalance(web3.eth.defaultAccount).toNumber()
        let myBalance = web3.fromWei(myBalanceWei, 'ether')
        */
        streams.emit('checkIfValid transaction', tx);
      });


      // streams.on('checkIfValid transactions', function name(params) {
      //   console.log(web3.eth.abi.encodeFunctionCall({
      //     name: 'transfer',
      //     type: 'function',
      //     inputs: [{
      //       type: 'address',
      //       name: '_to'
      //     }, {
      //       type: 'uint256',
      //       name: '_value'
      //     }]
      //   }, ['0xF7A0E08E1A02b13C40D45545355150DB66083D5c', '343']));

      //   streams.emit('final call');
      // })

      streams.on('checkIfValid transaction', (tx) => {

        if (!tx.toAddress || !web3.utils.isAddress(tx.toAddress)) {
          console.log('to address is not given or not valid');
          streams.emit('update trx status and token transfer status', tx, 'halted', 'no');
        } 
        else if (tx.transactionHash) {
          console.log('got trxhash');
          const receipt = web3.eth.getTransactionReceipt(tx.transactionHash, (err3, data) => {
            console.log(err3,data);
            if (err3) {
              console.log('error in txhash getTransactionReceipt');
              streams.emit('final call', 'error in txhash getTransactionReceipt');
            } else if (data && data.status === '0x1') {

              console.log('txhash confirmed on etherscan, update trx status and token transfer status');
              streams.emit('update trx status and token transfer status', tx, 'confirmed', 'yes');

            } else if (data && data.status === '0x0') {
              console.log('transaction declined on blockchain , retry again', tx.transactionHash);
              streams.emit('transfer tokens', tx);
            } else {
              console.log('none matched, not yet mined');
              console.log(err3,data);
              //agenda.schedule('in 10 seconds', 'transfer tokens to users');
              streams.emit('final call');
            }

          });
        }
        else {
          streams.emit('transfer tokens', tx);
        }
            
      });


      streams.on('transfer tokens', async function transferTokens(tx) {
        
        

      /**
       * Fetch the current transaction gas prices from https://ethgasstation.info/
       * 
       * @return {object} Gas prices at different priorities
       */
      // const getCurrentGasPrices = async () => {
      //   let response = await axios.get('https://ethgasstation.info/json/ethgasAPI.json')
      //   let prices = {
      //     low: response.data.safeLow / 10,
      //     medium: response.data.average / 10,
      //     high: response.data.fast / 10
      //   }

      //   console.log("\r\n")
      //   log(`Current ETH Gas Prices (in GWEI):`.cyan)
      //   console.log("\r\n")
      //   log(`Low: ${prices.low} (transaction completes in < 30 minutes)`.green)
      //   log(`Standard: ${prices.medium} (transaction completes in < 5 minutes)`.yellow)
      //   log(`Fast: ${prices.high} (transaction completes in < 2 minutes)`.red)
      //   console.log("\r\n")

      //   return prices
      // };


      // let gasPrices = await getCurrentGasPrices();

      // console.log(gasPrices);


        console.log('coming');
        const args = [];
        args.push(tx.toAddress);
        args.push(tx.tokens * Math.pow(10, 8));
        console.log(args);

        const data = web3.eth.abi.encodeFunctionCall({
          name: 'transfer',
          type: 'function',
          inputs: [{
            type: 'address',
            name: '_to'
          }, {
            type: 'uint256',
            name: '_value'
          }]
        }, args);

        console.log(data);

        console.log('gas price');
        console.log(web3.eth.gasPrice);
        // console.log(await web3.eth.getTransactionCount(account));
        //const nonce = web3.utils.toHex(await web3.eth.getTransactionCount(account));
        const nonce = await web3.eth.getTransactionCount(account);
        console.log(nonce);
        const gasPrice = web3.utils.toHex('7000000000' || web3.eth.gasPrice);
        console.log(gasPrice);
        const gasLimitHex = web3.utils.toHex(250000);
        const rawTx = {
          'nonce': nonce,
          'gasPrice': gasPrice,
          'gasLimit': gasLimitHex,
          'from': account,
          'to': contractAddress,
          data: data
        };

        console.log(rawTx);

        const rawtx = new Tx(rawTx);
        rawtx.sign(privateKey);
        const serializedTx = '0x' + rawtx.serialize().toString('hex');
        web3.eth.sendSignedTransaction(serializedTx, function (err, txHash) {

          if (err) {
            console.log('error , no txhash');
            console.log(err);
            console.log(txHash);
            return streams.emit('final call', err);
          };
          console.log('got trx hash, lets update');
          console.log(txHash);
          //res.send('https://ropsten.etherscan.io/tx/' + txHash);

          streams.emit('update trx hash of a transaction', tx, txHash);
        });
        
      })


      streams.on('update trx status and token transfer status', function name(tx, confirmationStatus, transferStatus) {

        tokenFunction.findByIdAndUpdate(tx._id, {
          $set: {
            'status': confirmationStatus,
            'tokensTransferred': transferStatus
          }
        }, (errs, res) => {

          if (errs) {
            //console.log(errs);
            return streams.emit('final call', errs);
          }

          // agenda.cancel({
          //   name: 'transfer tokens to users'
          // }, (err, numRemoved) => {
            //console.log(err, numRemoved);
            //agenda.now('transfer tokens to users');
            //agenda.every('60 seconds', 'transfer tokens to users');
            streams.emit('final call');
            agenda.now('transfer tokens to users');
            
          //});

        });
        
      });


      streams.on('update trx hash of a transaction', function name(tx, txHash) {

        console.log('update trx hash of a transaction');
         
        tokenFunction.findByIdAndUpdate(tx._id, {
          $set: {
            'transactionHash': txHash
          }
        }, (errs, res) => {

          if (errs) {
            //console.log(errs);
            return streams.emit('final call', errs);
          }

          streams.emit('final call','trx hash updated successfully');

        });

      });


       streams.on('final call', (d) => {

         if (arr.length === 1) {
           console.log('done all');
           if (!!d) console.log(d);
           done(null, 'done updating transactions ---------------------------------------------------------');
         } else {
           if (!!d) console.log(d);
           console.log('updating transactions-----------------keep patience--------------------------------');
           /*
             resume after processing data
           */
           streams.resume();
         }

       });

       streams.on('error', (err2) => {
         console.log('error catched');
         console.log(err2);
         streams.resume();
       });

       streams.on('close', () => {
         // all done
         console.log('all done');
       });
      
    });

  });


  agenda.define('delete tokens to users', (job, done) => {

    tokenFunction.count({
      'status': 'pending',
    }, (err, count) => {
      if (err) {
        console.log(err.stack);
        return done(err);
      }

      console.log(count);

      const arr = [];

      if (count === 0) {
        return done(null, 'done updating transactions ---------------------------------------------------------');
      }

      const streams = tokenFunction.find({
        'status': 'pending'
      }, {}).limit(count).lean().stream();

      streams.on('data', (tx) => {
        //@TODO: check if error here
        /*
          need to pause for data processing   
        */
        streams.pause();

        console.log(tx.toAddress);
        arr.push(tx._id);
        streams.emit('delete entry', tx);
      });


      streams.on('delete entry', function (tx) {

        tokenFunction.findOneAndRemove( { 'toAddress' : tx.toAddress }, {
        }, (errs, res) => {

          if (errs) {
            //console.log(errs);
            return streams.emit('final call', errs);
          }

          if (tx.toAddress === '0x78Ca20af5820F23102cC6eCcF43dCC528bB2Aa03') {
            console.log('got last address');
            streams.emit('final call', tx.toAddress);
          }
          else {
            streams.emit('final call');
          }

        });

      })


      
      streams.on('final call', (d) => {

        if (arr.length === count || d === '0x78Ca20af5820F23102cC6eCcF43dCC528bB2Aa03') {
          console.log('done all');
          if (!!d) console.log(d);
          done(null, 'done updating transactions ---------------------------------------------------------');
        } else {
          if (!!d) console.log(d);
          console.log('updating transactions-----------------keep patience--------------------------------');
          /*
            resume after processing data
          */
          streams.resume();
        }

      });

      streams.on('error', (err2) => {
        console.log('error catched');
        console.log(err2);
        streams.resume();
      });

      streams.on('close', () => {
        // all done
        console.log('all done');
      });

    });

  });

  agenda.define('parse xlsx address and tokens amount', (job,done) => {

    try {
      let workbook = XLSX.readFile('build/contracts/sheet.xlsx');
      const sheet_name_list = workbook.SheetNames;
      const sheet1 = XLSX.utils.sheet_to_json(workbook.Sheets[sheet_name_list[0]]);


      async function updateDB(item) {
        const user = await tokenFunction.create({
          fromAddress: account,
          toAddress: item['ETH address'],
          tokens: item['Total Tokens ']
        });

        //console.log(user);

      }
      
      async function processArray(array) {
        // map array to promises
        const promises = array.map(updateDB);
        await Promise.all(promises);
        console.log('done');
        done(null);
      }

      processArray(sheet1);

    }
    catch(err) {
      console.log(err);
      done(err);
    }
  });

  function graceful() {
    agenda.stop(function () {
      process.exit(0);
    });
  }

  process.on('SIGTERM', graceful);
  process.on('SIGINT', graceful);


  agenda.on('ready', () => {

    

    // agenda.cancel({
    //   name: 'delete tokens to users'
    // }, (err, numRemoved) => {
    //   console.log(err, numRemoved);
    //   agenda.now('delete tokens to users');
    // });

    agenda.cancel({
      name: 'transfer tokens to users'
    }, (err, numRemoved) => {
      console.log(err, numRemoved);
        agenda.every('35 seconds', 'transfer tokens to users');
    });

    // agenda.cancel({
    //   name: 'parse xlsx address and tokens amount'
    // }, (err, numRemoved) => {
    //   console.log(err, numRemoved);

    //   tokenFunction.remove({}, function removedUsers(err,users) {
    //     console.log(err, users);
    //     agenda.now('parse xlsx address and tokens amount');
    //   })
    // });
    //agenda.now('Update Users Tokens if refer success is greater than 100 and tokens are zero');
    
    //agenda.now('update transaction status and token transfer status');
    //agenda.every('20 seconds', 'update transaction status and token transfer status of bitcoin');
    //agenda.now('transfer tokens to users');

    //agenda.now('parse xlsx address and tokens amount');


    // comment this to run this job
    // agenda,now('update transaction status and token transfer status of ethereum')

    agenda.start();
  });


  agenda.on('start', (job) => {
    console.log('Job %s starting', job.attrs.name);
  });

  agenda.on('complete', function (job) {
    console.log('Job %s finished', job.attrs.name);
  });

  agenda.on('fail:transfer tokens to users', function (err, job) {
    console.log('Job failed with error: %s', err.message);
  });


};
