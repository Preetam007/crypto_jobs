let crypto = require('crypto');

const logger = require('config/logger');
/* module.exports.getRandomToken = () => {
	return new Promise((resolve, reject) => {
		crypto.randomBytes(32, function (ex, buf) {
			var token = buf.toString('hex');
			resolve(token);
		});
	});
}; */


module.exports.removeFalsy = (req,res,next) => {
  const newObj = {};
  Object.keys(req.body).forEach((prop) => {
    if (!!req.body[prop]) {
      newObj[prop] = req.body[prop];
    }
  });
  req.body = newObj;
  logger.debug(req.body);
  return next();
};

module.exports.getRandomToken = function () {
  const token = crypto.randomBytes(64).toString('hex');
  //console.log(token);
  return token;
};

module.exports.findElementWithProp = ({ array,prop,value })=>{
  let element = false;
  for (let index = 0; index < array.length; index++) {
    if (array[index][prop] === value) {
      element = array[index];
      break;
    }
  }
  return element;
};
