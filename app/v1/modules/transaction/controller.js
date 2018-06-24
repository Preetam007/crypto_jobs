const model = require('./model'),
  logger = require('config/logger');

const controller = Object.create(null);

controller.getPendingTrxns = ()=>{
    var tsxnStream = model.find({status : 'pending'}).stream();

    tsxnStream.on('data', function (pendingTrxns) {
        if (!pendingTrxns) {
            return false;
        }
        console.log(pendingTrxns);
    });
    
    tsxnStream.on('error', function (err) {
      // handle err
    });
    
    tsxnStream.on('close', function () {
      // all done
    });
}

module.exports = controller;