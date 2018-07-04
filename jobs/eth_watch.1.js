const Agenda = require('agenda');
const request = require('request');
require('dotenv').config();
const Web3 = require('web3');
const web3 = new Web3(new Web3.providers.HttpProvider(`https://mainnet.infura.io/${process.env.INFURA_ACCESS_TOKEN}`));
const internalTrxnUrl = 'https://api.etherscan.io/api?module=account&action=txlistinternal&txhash=%trxnHash%&apikey=QZT28CGN1B29ENZTMDUKENIYBCJ9PWIZ87';
const THE_ADDRESS = process.env.CONTRACT_ADDRESS;
const TOKEN_ADDRESS = process.env.TOKEN_ADDRESS;
const logger = require('config/logger');

  const agenda = new Agenda({
    maxConcurrency: 1,
    db: {
      address: 'mongodb://localhost/idap',
      collection: 'agendaJobs'
    }
  });
  const modelFunction = require('../app/v1/modules/user/model');
  const txFUnction = require('../app/v1/modules/transaction/model');

  agenda.define('update transaction status and token transfer status',(job,done) => {
    txFUnction.count({
      'status': 'pending',
      'type': 'Ethereum'
    }, (err, count) => {
      if (err) {
        console.log(err.stack);
        return done(err);
      }

      console.log(count);
      const arr = [];

      const streams = txFUnction.find({
        'status': 'pending',
        'type': 'Ethereum'
      }, {}).limit(count).lean().stream();

      streams.on('data', (tx) => {
        //@TODO: check if error here
        /*
          need to pause for data processing   
        */
        streams.pause();

        console.log(tx);
        arr.push(tx._id);
        streams.emit('checkIfValid transaction', tx);
      });

      streams.on('checkIfValid transaction', (tx) => {

        if (!tx.transactionHash) {
          return streams.emit('error', 'tx hash is not given');
        }

        console.log('coming');
        const receipt = web3.eth.getTransactionReceipt(tx.transactionHash, (err3, data) => {
          console.log(data);
          if (err3) {
            streams.emit('handle invalid and failed transaction hash' ,tx);
          } else if (data && data.status === '0x1') {
            
            if (data.from !== tx.fromAddress || data.to !== tx.toAddress) {
              console.log('update valid, invalid , failed , user entry wrong inputs trx 1');
              streams.emit('update valid, invalid , failed , user entry wrong inputs trx', tx, 'cancelled');
            }
            else {
              streams.emit('txhash confirmed on etherscan, get internal trxs', tx, data);
            }

          } else if (data && data.status === '0x0') {
            console.log('transaction declined on blockchain', tx.transactionHash);
            streams.emit('update valid, invalid , failed , user entry wrong inputs trx', tx, 'cancelled');
          }
          else {
            streams.emit('final call');
          }

        });

      });


      streams.on('txhash confirmed on etherscan, get internal trxs', (tx,etherTx) => {
        console.log('internals');
        request.get({
          uri: internalTrxnUrl.replace('%trxnHash%', etherTx.transactionHash)
        }, (err1, res, body) => {
          const ResBody = body ? JSON.parse(body) : {};

          console.log(ResBody);

          if (err1) {
            return streams.emit('error', err1);
          }
          else if (ResBody.message !== 'OK' || ResBody.status !== '1') {
            console.log('error unexpected result , no documentation on etherscan');
            streams.emit('error', 'unexpected result , no documentation on etherscan');
          }
          else {

            if (!!ResBody.result && ResBody.result[0].isError === '0') {
              console.log('all good , lets do this');
              //all good , lets do this
              const ethAmount = ResBody.result[0].value / Math.pow(10, 18);

              if ( Math.round(ethAmount * 100) / 100 ===  Math.round(tx.amount * 100) / 100) {
                console.log('we did it');
                streams.emit('update valid, invalid , failed , user entry wrong inputs trx', tx, 'confirmed', etherTx);
              } 
              else {
                // mismatch  in values , lets halt this transaction for now
                streams.emit('update valid, invalid , failed , user entry wrong inputs trx', tx, 'halted');
              }

            }
            else {
              // error in internal transaction
              streams.emit('error', 'error in internal transaction');
            }
          }

        });

      });

      streams.on('update valid, invalid , failed , user entry wrong inputs trx', (tx, type,etherTxData) => {

        const updateObj = {
          'status': type
        };

        if (type === 'confirmed') {
          updateObj.tokensTransferred = 'yes';
        }

        txFUnction.findByIdAndUpdate(tx._id, {
          $set: updateObj
        }, (errs, res) => {

          if (errs) {
            console.log(errs);
            return streams.emit('error', errs);
          }

          // check no of tokens in a transaction .
          if (type === 'confirmed') {
            streams.emit('check tokens transferred in a request and update tokens of user', tx, etherTxData);
          }
          else {
            streams.emit('final call');
          }

        });
           
      });

      streams.on('check tokens transferred in a request and update tokens of user', (tx, etherTxData) => {

        
        let logsBloom, topics1, topics2, logsData;
        logsBloom = etherTxData.logsBloom;

        for (let index = 0; index < etherTxData.logs.length; index++) {
          const element = etherTxData.logs[index];

          // this is token address
          if (element.address === '0x1aa800840f7524938bEDafa460997bA30ec4b235') {
            console.log('matched');
            // topics[o] is signature of Transfer event function
            topics1 = element.topics[1];
            topics2 = element.topics[2];
            logsData = element.data;
          }
          else {
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
        }
        catch(err3) {
          logger.error(err3);
          streams.emit('error','error in decoding logs');
        }


      });


      streams.on('update user tokens in user schema', (tx, amount) => {
        const up = `tokens.${tx.phase}`;
        modelFunction.findByIdAndUpdate(tx.initiatedBy.id, {
          $inc : {
            [up]: parseInt(amount),
            'tokens.total': parseInt(amount)
          }
        }, (errs, res) => {

          if (errs) {
            console.log(errs);
            return streams.emit(errs, 'error in tokens update');
          }
          streams.emit('final call');

        });

      });

      streams.on('final call', () => {

        if (arr.length === count) {
          console.log('done all');
          done(null, 'done updating transactions ---------------------------------------------------------');
        } 
        else {
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
        logger.error(err2);
        streams.resume();
      });

      streams.on('close', () => {
        // all done
        console.log('all done');
      });

    });
  });


  agenda.on('ready', () => {
    //agenda.now('Update Users Tokens if refer success is greater than 100 and tokens are zero');
    // agenda.every('10000 seconds', 'update transaction status and token transfer status');
    agenda.now('update transaction status and token transfer status');
    agenda.every('30 minutes', 'update transaction status and token transfer status');
    agenda.start();
  });


  agenda.on('start', (job) => {
    console.log('Job %s starting', job.attrs.name);
  });

