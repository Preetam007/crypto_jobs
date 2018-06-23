const mongoose = require('mongoose'),
  bcrypt = require('bcrypt-nodejs'),
  presets = require('utils/presets'),
  {
    genShortId
  } = require('utils/helper');

const logger = require('config/logger');
const kycDocumentsSchema = new mongoose.Schema({
  documentType: {
    type: String,
    enum: ['PAN', 'AADHAAR', 'DRIVING_LICENSE'],
    required: true
  },
  imageFront: String,
  imageBack: String
}, {
  timestamps: {
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  }
});

const walletAddressSchema = mongoose.Schema({
  ticker: {
    type: String,
    enum: ['BITCOIN', 'ETHEREUM'],
    required: false
  },
  address: {
    type: String,
    required: false
  },
  balance: {
    type: String,
    required: false
  },
  mnemonic: {
    type: String,
    required: false
  },
  privateKey: {
    type: String,
    required: false
  }
});

const userSchema = new mongoose.Schema({
  local: {
    'email': {
      type: String,
      trim: true
    },
    'password': String,
    'isPrimary': {
      type: Boolean,
      default: false
    },
    '2FA': {
      secretKey: {
        type: String,
        default: ''
      },
      isEnabled: {
        type: Boolean,
        default: false
      }
    }
  },
  facebook: {
    id: String,
    token: String,
    email: String,
    name: String,
    isPrimary: {
      type: Boolean,
      default: false
    }
  },
  google: {
    id: String,
    token: String,
    email: String,
    name: String,
    isPrimary: {
      type: Boolean,
      default: false
    }
  },
  //Track
  personalDetails: {
    fullName: {
      type: String,
      trim: true
    },
    phoneNumber: {
      type: String,
      trim: true
    },
    telegram: {
      type: String,
      trim: true
    },
    ethAddress: {
      type: String,
      trim: true
    }
  },
  wallets: [walletAddressSchema],
  kycDetails: {
    address: String,
    city: String,
    state: String,
    postcode: {
      type: String,
      trim: true
    },
    documents: [kycDocumentsSchema]
  },
  contributionRange: String,
  role: {
    type: String,
    enum: ['USER', 'ADMIN', 'SUPER_ADMIN'],
    default: 'USER',
    required: true
  },
  createdAt: {
    type: Number,
    default: null
  },
  loginAt: {
    type: Number,
    default: null
  },
  updatedAt: {
    type: Number,
    default: null
  },
  //unblockAt: { type: Number, default: null, select: false },
  //attempt: { type: Number, default: 1, select: false },
  resetPassword: {
    token: {
      type: String,
      default: null
    },
    attempts: {
      type: Number,
      default: 0
    },
    expiresAt: {
      type: Date,
      default: 0
    }
  },
  //Required
  email: {
    value: {
      type: String,
      unique: true,
      trim: true,
      sparse: true
    },
    isVerified: {
      type: Boolean,
      default: false
    }
  },
  refer: {
    code: {
      type: String,
      trim: true
    },
    referralCode: {
      type: String,
      trim: true
    },
    totalUsed: {
      type: Number,
      default: 0
    },
    success: {
      type: Number,
      default: 0
    },
    referee: {
      type: mongoose.Schema.Types.ObjectId,
      default: null,
      ref: 'user'
    }, // referred by
    refereeCode: {
      type: String
    }, // 
    refereeEmail: {
      type: String,
      trim: true
    },
    voted: {
      type: Boolean,
      default: false
    } // isVoted
  },
  subscribe: {
    email: {
      type: String,
      unique: true,
      sparse: true
    },
    //isSubscribed : {type:Boolean},
    verificationHash: {
      type: String
    },
    isVerified: {
      type: Boolean,
      default: false
    }
  },
  userState: {
    type: String,
    required: true,
    default: presets.stateUser,
    enum: [presets.stateUser, presets.stateSubscriber]
  },
  accountState: {
    type: String,
    required: true,
    default: presets.emailEntered,
    enum: [presets.emailEntered, presets.emailVerified,
      presets.userVerified, presets.userInactive, presets.userActive, presets.userBlocked
    ]
  },
  votes: [{
    type: String
  }],
  tokens: {
    total: {
      type: Number,
      default: 0
    },
    privateSale: {
      type: Number,
      default: 0
    },
    preSale: {
      type: Number,
      default: 0
    },
    crowdSale: {
      type: Number,
      default: 0
    },
    referral: {
      type: Number,
      default: 0
    },
    vote: {
      type: Number,
      default: 0
    }
  },
  kycStatus: {
    type: String,
    enum: ['ACCEPTED', 'REJECTED', 'SUBMITTED', 'PENDING'],
    required: true,
    default: 'PENDING'
  },
  accountVerify: {
    verificationHash: {
      type: String
    },
    isVerified: {
      type: Boolean,
      default: false
    },
    expiresAt: {
      type: Date
    }
  },
  defaultVerificationMethod: {
    type: String,
    enum: ['email', 'otp', 'call'],
    default: 'email'
  },
  termsAccepted: {
    type: Boolean,
    default: false,
    required: true
  },
  isUs: {
    type: Boolean,
    default: false,
    required: true
  },
  userIp: {
    type: String
  },
  //State Variables
  isBlocked: {
    type: Boolean,
    default: false,
    select: false
  },
  blockedAt: {
    type: Date,
    default: null
  },
  isActive: {
    type: Boolean,
    default: true
  },
  source: {
    utm: {
      type: String,
      default: 'utm'
    },
    gtm: {
      type: String,
      default: 'utm'
    }
  }
}, {
  timestamps: {
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  }
});



const User = mongoose.model('User', userSchema);
module.exports = User;


// indexing, mongoose-created,update_at,
