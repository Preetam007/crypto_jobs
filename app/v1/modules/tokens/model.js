const mongoose = require('mongoose'),
  //mongoose_delete = require('mongoose-delete'),
  constants = require('config/constants');

const RecordSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  tokens: { type: Number , default : 0 },
  transactionHash : { type : String },
  status : { type : String , enum: constants.possibleTrxnStatus, default : 'pending' },// 1st fun
  tokensTransferred : { type : String , enum : constants.possibleTokenTransferStatus , default : 'no' },//2nd fun
  fromAddress : { type : String , trim : true }, // from address user is sending , in case of contract it is contract address
  toAddress : { type: String  , trim : true} // where we have to send tokens
},
{
  timestamps: {
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  }
});

const Token = mongoose.model('Token', RecordSchema);
module.exports = Token;
