const express = require('express'),
  config = require('./config/'),
  env = require('./config/env'),
  mongoose = require('mongoose'),
  Agenda = require('agenda'),
  Agendash = require('agendash'); // eslint-disable-line

// Adding the root project directory to the app module search path:
require('app-module-path').addPath(__dirname);

mongoose.connect(config.db, {
  auto_reconnect: true,
  socketOptions: {
    keepAlive: 500,
    connectTimeoutMS: 90000,
    socketTimeoutMS: 90000
  },
  connectWithNoPrimary: true
}, function (err) {
  if (err) {
    console.log('❌ ' + 'Mongodb Connection Error');
    console.log(err);
  } else {
    console.log('✅ ' + 'Mongodb Connected');
  }

});

var db = mongoose.connection;

db.on('error', function () {
  throw new Error('❌ ' + 'Unable to connect to database at ' + config.db);
});
db.once('open', function callback() {
  console.log('✅ ' + 'Connected to Database : ' + config.db.substring(config.db.lastIndexOf('/') + 1, config.db.length));
});

const app = express();


const agenda = new Agenda({
  db: {
    address: 'mongodb://localhost/idap',
    collection: 'agendaJobs'
  }
});

require('./jobs/eth')(agenda);

app.use('/jobs/agendash', Agendash(agenda));

app.listen(config.port, () => {
  console.log(`Express server listening on port ${config.port}\nOn env ${env}`);
});



process.on('unhandledRejection', (reason, p) => {
  console.log('UNHANDLED REJECTION', reason, p);
});

process.on('uncaughtException', (error) => {
  console.log('UNCAUGHT EXCEPTION', error);
  
  process.exit(1);
});

// If the Node process ends, close the Mongoose connection
process.on('SIGINT', () => {
  db.close(() => {
    console.log('Mongoose default connection disconnected through app termination');
    process.exit(0);
  });
});