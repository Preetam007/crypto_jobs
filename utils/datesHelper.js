/**
 * Created by a developer on 05/11/17.
 */

let moment = require('moment');

let format = {
  date: 'D/M/YYYY',
  timeStamp: 'D/M/YYYY hh:mm:ss',
  time: 'hh:mm:ss'
};


//Current Timestamp
let unixTimestamp = function () {
  return moment().unix();
};

//Convert date to timestamp
let dateToUnix = function (input) {
  return moment(input, format.timeStamp).unix();
};

//Convert to full date
let unixToFullDate = function (input) {
  return moment(moment.unix(input)).utcOffset('+05:30').format(format.timeStamp);
};

//Convert to date
let unixToDate = function (input) {
  return moment(moment.unix(input)).utcOffset('+05:30').format(format.date);
};

//Convert to time
let unixToTime = function (input) {
  return moment(moment.unix(input)).utcOffset('+05:30').format(format.time);
};

//Add minutes to timestamp
let addToTimestamp = function (input) {
  return unixTimestamp() + input * 60;
};

//Difference in sec
let diff = function (low, high) {
  return moment(high).diff(low);
};

let docPrefix = function () {
  return moment().format('YYYY_MMM_DD_');
};

module.exports = {
  unixTimestamp: unixTimestamp,
  dateToUnix: dateToUnix,
  unixToFullDate: unixToFullDate,
  unixToDate: unixToDate,
  unixToTime: unixToTime,
  addToTimestamp: addToTimestamp,
  diff: diff,
  docPrefix: docPrefix
};
