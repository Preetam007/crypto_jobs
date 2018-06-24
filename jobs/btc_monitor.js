var _ = require('lodash');
var async = require('async');
var modelFunction = require('./app/v1/modules/user/doa');
var schedule = require('node-schedule');
const config = require('../config/');
const mongoose = require('mongoose');
var config_crypto = require('../config/config-crypto');
var network = config_crypto.getNetwork();
var request = require('request');
taskSchedule = new schedule.RecurrenceRule();
// taskSchedule.minute = new schedule.Range(0, 59, 5);
// const fs = require('fs');

const Web3 = require('web3')


// Adding the root project directory to the app module search path:
require('app-module-path').addPath(__dirname);

// Minimum confirmation count to mark fd active
const minConfirmations = 3;



function Service() {};
// taskSchedule.minute = new schedule.Range(0, 59, 5);

// after every 5 second
taskSchedule.second = 1;

// Service.prototype.btc_api_url = config_crypto[network].btc_api_url;
Service.prototype.start = function () {
  var self = this;
  self.eth_api_url = config_crypto[network].eth_api_url;
  self.btc_api_url = config_crypto[network].btc_api_url;
  // initialize web3
  self._initWeb3();
  console.log('Prototype started');
  async.series([
    function (done) {
      // Start recurring task
      // schedule.scheduleJob({minute: 45}, function(err, res) { // commenting this out for later
      schedule.scheduleJob({
        second: 1
      }, function (err, res) {
        console.log('starteeed btc taks');
        self._startTask_btc();
        // done();
      });
    },
  ], function (err) {
    if (err) {
      log.error(err);
    }
  });
}
Service.prototype._initWeb3 = function () {
  // provider = new HDWalletProvider(mnemonic, config[network].provider())
  // web3 = new Web3(provider);

  const web3 = new Web3(new Web3.providers.HttpProvider("https://ropsten.infura.io/um1wlpD1xMNV8UJf9tol"));
  var abiArray = require('./icowhitelistabi.json');
  // icowhitelist contract address rinkbey testnet
  const contractAddress = '0x0a70e9adb7cd29d982bcbd468b58c849839fcf34';
  const whiteListClass = web3.eth.contract(abiArray)
  whiteListContract = whiteListClass.at(contractAddress);
}


Service.prototype._startTask_btc = function () {
  var self = this;
  modelFunction.find({
    params: {},
    cb: function (err, value) {
      if (err) return log.error(err);
      if (!value) return log.error('no user');
      if (value.length > 0) {
        var txHashesOfNotDone = [],
          txHashesOfDone = [];
        _.forEach(value, function (res) {
          if (res.txs.length > 0) {
            _.forEach(res.txs, function (tx) {
              if (tx.status == 'confirmed' && tx.type == 'btc') {
                self.callContractforBtc(tx.hash, res.depositAddrBtc, res.userEthAddr, function (err, resp) {
                  if (err) return console.log('Error: ' + err);
                  self.updateTxStatus(res._id, tx.hash, 'approved');
                });
                txHashesOfDone.push(tx.hash);
              } else if (tx.status == 'approved')
                txHashesOfDone.push(tx.hash);
              else txHashesOfNotDone.push(tx.hash);
            });
            if (txHashesOfNotDone.length > 0 || txHashesOfDone.length > 0)
              // dont add same txs
              self.checkUserHasDoneTx(res, txHashesOfDone, txHashesOfNotDone);
          } else {
            self.checkUserHasDoneTx(res);
          }
        });
      } else return log.error('Error in Executing Service');
    }
  });
}


Service.prototype.checkUserHasDoneTx = function (user, txHashesOfDone, txHashesOfNotDone) {
  var self = this;
  if (user.depositAddrBtc) {
    if (!txHashesOfDone) txHashesOfDone = [];
    if (!txHashesOfNotDone) txHashesOfNotDone = [];
    request(self.btc_api_url + 'txs/?address=' + user.depositAddrBtc, function (error, response, body) {
      if (!error && response && response.statusCode == 200) {
        var body_json = JSON.parse(body);
        if (body_json.txs.length > 0) {
          body_json.txs.forEach(function (each_tx) {
            if (_.includes(txHashesOfDone, each_tx.txid)) return console.log('btc tx already mapped');
            var json = {};
            json.in = 0
            json.out = 0
            json.hash = each_tx.txid;
            json.type = 'btc';
            json.timeStamp = Number(Math.floor(Date.now() / 1000));
            each_tx.vout.forEach(function (each_vout) {
              each_vout.scriptPubKey.addresses.forEach(function (outaddress) {
                if (outaddress === user.depositAddrBtc) {
                  json.in = json.in + each_vout.value * 100000000
                }
              })
            })
            each_tx.vin.forEach(function (each_vin) {
              if (each_vin.addr === user.depositAddrBtc) {
                json.out = json.out + each_vin.value * 100000000
              }
            })
            json.value = json.in - json.out;
            json.status = (each_tx.confirmations > minConfirmations) ? 'confirmed' : 'unconfirmed';

            if (_.includes(txHashesOfNotDone, each_tx.txid) && json.value > 0) {
              self.updateTxStatus(user._id, json.hash, json.status);
              return self.updateTx(user, json);
            }
            if (json.value > 0)
              return self.saveTx(user._id, json);

          });
        } else console.log('no tx done yet');
      } else {
        console.log('error in getting txs');
      }
    });
  }
};

Service.prototype.updateTx = function (user, tx) {
  console.log('^^^^^^^^^^^^^^^');
  var self = this;
  if (tx.status == 'confirmed' && tx.type == 'btc') {
    self.callContractforBtc(user._id, tx.hash, user.depositAddrBtc, user.userEthAddr, function (err, res) {
      if (err) return console.log('error in calling contract', err);
      // self.sendReceipt(user.email.value, user.fullName, tx, "btc");
      return self.updateTxStatus(user._id, tx.hash, 'processed');
    });
    // return self.updateTxStatus(user._id, tx.hash, 'approved');
    console.log('tx added to user');
  }
}

Service.prototype.updateTxStatus = function (user, txHash, status) {
  console.log('!!!!!!!!!!!!!!');
  console.log('----' + user + ' --- ' + txHash);
  modelFunction.update({
    "_id": user,
    'txs.hash': txHash
  }, {
    '$set': {
      'txs.$.status': status
    }
  }, function (err, res) {
    if (err) console.log(err);
    console.log(res);
    console.log('tx status updated')
  });
};

Service.prototype.saveTx = function (user, tx) {
  var self = this;
  modelFunction.findOneAndUpdate({
    query: {
      _id: user,
      'txs.hash': {
        $ne: tx.hash
      }
    },
    params: {
      $push: {
        "txs": {
          timeStamp: tx.timeStamp,
          status: tx.status,
          hash: tx.hash,
          value: tx.value,
          type: tx.type
        }
      }
    },
    cb: function (err, updatedObj) {
      if (!err) {
        // call contract to assign tokens
        self.updateTx(updatedObj, tx, function (err, res) {});
      } else {
        return console.log('error in adding tx to user');
      }
    }
  });
}

Service.prototype.callContractforBtc = function (userid, txid, depositAddr, userEthAddr, cb) {
  console.log('***********');
  var self = this;
  const total = whiteListContract.whitelistedInvestorsCount.call();
  console.log('===============totlal whitelist,', total);
};
