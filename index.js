const 
  config = require('./config/'),
  mongoose = require('mongoose');


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
    // cron job inside root because of project's structure with relative paths
    const service = require('./jobs/eth');
    service.start();

  }

});

var db = mongoose.connection;

db.on('error', function () {
  throw new Error('❌ ' + 'Unable to connect to database at ' + config.db);
});
db.once('open', function callback() {
  console.log('✅ ' + 'Connected to Database : ' + config.db.substring(config.db.lastIndexOf('/') + 1, config.db.length));
});


