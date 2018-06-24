const SHA3 = require('sha3');

// Generate 512-bit digest.
let d = new SHA3.SHA3Hash();
d.update('Transfer(address,address,uint256)');
d.digest('hex');

console.log(d);