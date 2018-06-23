const path = require('path');
let rootPath = path.normalize(`${__dirname}/..`),
  env = require('./env');


const config = {
  development: {
    root: rootPath,
    app: {
      name: 'idap-api-dev',
      domain: 'http://localhost:3000',
      webApi: 'v1',
      mobileApi: 'v1'
    },
    port: process.env.PORT || 4030,
    db: 'mongodb://localhost/idap',
    redis: '999999',
    smsSender: {
      plivo: {
        accountSid: process.env.plivoAccountSid || '234234',
        authToken: process.env.plivoAuthToken || '999999',
        number: '234324234'
      },
      msg91: {
        authkey: process.env.msg91Authkey || '999999'
      }
    },
    emailSender: {
      google: {
        service: process.env.emailService || 'Gmail',
        sender: process.env.emailId || 'colossusapi@gmail.com',
        pass: process.env.emailPass || 'colossus@123',
        name: 'IDAP.IO',
        logo: 'https://i.imgur.com/m0SU0P6.png'
      }
    },
    recaptcha: {
      isEnabled: false,
      site_key: '999999',
      secret_key: '999999'
    },
    usdToInrApi: 'http://api.fixer.io/latest?base=USD&to=INR',
    proUserAddress: ''
  },
  staging: {
    root: rootPath,
    app: {
      name: 'idap-api-dev',
      domain: 'http://localhost:3000',
      webApi: 'v1',
      mobileApi: 'v1'
    },
    port: process.env.PORT || 4030,
    db: 'mongodb://localhost/idap',
    redis: '999999',
    smsSender: {
      plivo: {
        accountSid: process.env.plivoAccountSid || '234234',
        authToken: process.env.plivoAuthToken || '999999',
        number: '234324234'
      },
      msg91: {
        authkey: process.env.msg91Authkey || '999999'
      }
    },
    emailSender: {
      google: {
        service: process.env.emailService || 'Gmail',
        sender: process.env.emailId || 'colossusapi@gmail.com',
        pass: process.env.emailPass || 'colossus@123',
        name: 'IDAP.IO',
        logo: 'https://i.imgur.com/m0SU0P6.png'
      }
    },
    recaptcha: {
      isEnabled: false,
      site_key: '999999',
      secret_key: '999999'
    },
    usdToInrApi: 'http://api.fixer.io/latest?base=USD&to=INR',
    proUserAddress: ''
  },
  production: {
    root: rootPath,
    app: {
      name: 'IDAP-api-dev',
      domain: 'http://139.59.18.95:3000',
      webApi: 'v1',
      mobileApi: 'v1'
    },
    port: process.env.PORT || 3000,
    db: 'mongodb://localhost/idap',
    redis: '3423423',
    smsSender: {
      plivo: {
        accountSid: process.env.plivoAccountSid || '423423',
        authToken: process.env.plivoAuthToken || '2342342',
        number: '+999999'
      },
      msg91: {
        authkey: process.env.msg91Authkey || '23423423'
      }
    },
    emailSender: {
      sender: '999999@999999.io',
      mailgun: {
        apiKey: process.env.mailgunApiKey || '76890',
        domain: process.env.mailgunDomain || '235467'
      }
    },
    recaptcha: {
      isEnabled: false,
      site_key: '23423423',
      secret_key: '234234234'
    },
    usdToInrApi: 'http://api.fixer.io/latest?base=USD&to=INR',
    proUserAddress: ''
  }
};


module.exports = config[env];
