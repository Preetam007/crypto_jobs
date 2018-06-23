const preset = {
  maxLoginAttempts: 3,
  resettokenExpiresAt : 24*3600000,
  tokenExpiryTime: '30m',
  rememberTokenExpiryTime: '30d',
  tokenSecret : 'sshhhhh',
  unblockTime: 1, // days
  emailEntered: 'e',
  emailVerified: 'e_v',
  userVerified: 'verified',
  userActive: 'active',
  userInactive: 'inactive',
  userBlocked: 'blocked',
  stateUser : 'USER',
  stateSubscriber : 'SUBSCRIBER'
};

module.exports = preset;
