const redis = require('redis');

const client = redis.createClient();

// if you'd like to select database 3, instead of 0 (default), call 
// client.select(3, function() { /* ... */ }); 

client.on('error', (err) => {
  console.log(`Error ${err}`);
});

module.exports.redisClient = client;
