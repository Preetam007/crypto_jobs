const env = require('./env');

let constantsObj = {
  'adminEmail': 'raopreetam007@gmail.com',
  'adminPassword' : '####',
  'adminFullName' : 'admin',
  'emailVerifyExpiry': Date.now() + 1800000000, // 30 mins
  'referInviteUrl' : 'tokensale.jobs.io/signup/refer',
  'ico' : {
    'tokenUsd' : 0.03,
    'ethUsd' : 600,
    'ethAddress': '#####',
    'stage' : 'Private sale',
    'btcUsd' : 7500,
    'btcAddress': '#####',
    'discount': 0
  },
  'possibleTrxnStatus' : ['confirmed', 'pending', 'halted','cancelled'],
  'possibleTokenTransferStatus' : ['yes','no'],
  'possibleIcoPhases' : ['privateSale','preSale','crowdSale']
};

switch (env) {
  case 'production':
    constantsObj.baseUrl = 'https://tokensale.jobs.io';
    break;
  case 'staging':
    constantsObj.baseUrl = 'https://tokensale.jobs.io';
    break;
  case 'development':
    constantsObj.baseUrl = 'localhost:4030';
    break;
  default:
    break;
}

module.exports = constantsObj;
