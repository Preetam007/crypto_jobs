const mongoose = require('mongoose'),
  //mongoose_delete = require('mongoose-delete'),
  constants = require('config/constants');

const txnRecordSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  tokens: { type: Number , default : 0 },
  status : { type : String , enum: constants.possibleTrxnStatus, default : 'pending' },// 1st fun
  tokensTransferred : { type : String , enum : constants.possibleTokenTransferStatus , default : 'no' },//2nd fun
  initiatedBy: {
    id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    email: { type : String }
  },
  phase : { type : String , enum : constants.possibleIcoPhases , default : 'privateSale'  },
  type : { type : String ,enum: ['vote','refer','Ethereum','Bitcoin'] },
  method : { type : String ,enum: ['deposit','bonus','purchase']  },
  blockNumber : { type : String },
  fromAddress : { type : String }, // from address user is sending
  toAddress : { type: String }, // where user is sending eth/btc
  tokenReceivingAddress : { type : String } , // address where user wants token
  usdAmount : { type : Number } ,
  amount : { type : Number  }, // amount in btc or eth
  transactionHash : { type : String },
  direction : { type : String , enum : ['out','in'] },
  description : { type : String  }
},
{
  timestamps: {
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  }
});

/* const mdOptions = { 
  deletedAt : true,
  deletedBy : true,
  overrideMethods: 'all'
};

txnRecordSchema.plugin(mongoose_delete,mdOptions); */

const Transaction = mongoose.model('Transaction', txnRecordSchema);
module.exports = Transaction;
