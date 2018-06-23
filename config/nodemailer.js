// const nodemailer = require('nodemailer');
const mailConstructor = require('config/mailTemplates');
const logger = require('./logger');
const SparkPost = require('sparkpost');
const client = new SparkPost('2e9092c4bc9a69906808a3ad7ed64fbf0b4ff68d');

module.exports = ({ mailType, to, data }) => {
  let recepientArr = [];
  if(typeof to === 'string') {
    recepientArr.push({ address: to });
  } else {
    to.forEach(element => {
      recepientArr.push({ address: element });
    });
  }
  
  const mailContent = mailConstructor({ mailType,data });
  let subject = mailContent.subject,
    html = mailContent.html;

  client.transmissions.send({
    options: {
      sandbox: false
    },
    content: {
      from: 'support@idap.io',
      subject: subject,
      html: html
    },
    recipients: recepientArr/* [{
      address: to
    }] */
  })
    .then(response => { // eslint-disable-line
      console.log('Message sent to: %s', to);
      //console.log(response);
      logger.verbose('Message sent to: %s', to);
    })
    .catch(err => {
      console.log('Whoops! Something went wrong');
      console.log(err);
      logger.error(err);
    });

};

