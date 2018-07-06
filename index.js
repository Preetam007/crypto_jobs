const express = require('express'),
  config = require('./config/'),
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

require('./jobs/eth_watch.1')(agenda);

app.listen(4030, () => {
  console.log(`Express server listening on port ${config.port}\nOn env`);
});

app.use('/jobs/agendash', Agendash(agenda));