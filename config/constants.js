const env = require('./env'),
  responseMsgs = require('./responseMessages.json');

let referralTokenModel = [
  { min:1,max:4,tokens:4 },
  { min:5,max:24,tokens:6 },
  { min:25,max:49,tokens:8 },
  { min:50,max:99,tokens:10 },
  { min:100,max:100,tokens:12 }
];

let getReferralTokenInc = (referralNumber)=>{
  let tokens = 0;
  for (let index = 0; index < referralTokenModel.length; index++) {
    const element = referralTokenModel[index];
    if (element.min <= referralNumber && element.max >= referralNumber) {
      tokens = referralNumber * element.tokens;
      break;
    }
  }
  return tokens;
};

let constantsObj = {
  'adminEmail': 'quillhash3@gmail.com',
  'adminPassword' : 'admin#123$%',
  'adminFullName' : 'admin',
  getReferralTokenInc,
  responseMsgs,
  'votes': {
    min: 3,
    max: 1000
  },
  'voteRewardTokens' : 5,
  'gCaptcha' : {
    url : 'https://www.google.com/recaptcha/api/siteverify',
    secret: '6LdGeVEUAAAAAOwWFFaLgdef964EolWSKtB2m872'
  },
  'emailVerifyExpiry': Date.now() + 1800000000, // 30 mins
  'referInviteUrl' : 'tokensale.ipdap.io/signup/refer',
  'ico' : {
    'tokenUsd' : 0.03,
    'ethUsd' : 600,
    'ethAddress': '0xb0Bd5E5F19b08E14E7Ee4234D8A0dFA574a6120A',
    'stage' : 'Private sale',
    'btcUsd' : 7500,
    'btcAddress': '3FtFgSVPPEqusZXhm26mXmTkZHuwCFeGTb',
    'discount': 0
  },
  'possibleTrxnStatus' : ['confirmed', 'pending', 'halted','cancelled'],
  'possibleTokenTransferStatus' : ['yes','no'],
  'possibleIcoPhases' : ['privateSale','preSale','crowdSale']
};

switch (env) {
  case 'production':
    constantsObj.baseUrl = 'https://tokensale.idap.io';
    constantsObj.alertEmail = 'hello@quillhash.com';
    constantsObj.depositEmail = 'investment@idap.io';
    break;
  case 'staging':
    constantsObj.baseUrl = 'https://tokensale.idap.io';
    constantsObj.alertEmail = 'hello@quillhash.com';
    constantsObj.depositEmail = 'investment@idap.io';
    break;
  case 'development':
    constantsObj.baseUrl = 'localhost:4030';
    constantsObj.alertEmail = 'hello@quillhash.com';
    constantsObj.depositEmail = 'hello@quillhash.com';
    break;
  default:
    break;
}

module.exports = constantsObj;
