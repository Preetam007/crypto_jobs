const model = require('./model');
// = require('utils/datesHelper'),
// _ = require('lodash');

const find = function ({
  params = {},
  sort = {},
  skip = 0,
  limit = 0,
  selector = '',
  query = '',
  cb = () => {} // eslint-disable-line
}) {
  return new Promise((resolve, reject) => {
    model.find(params, (err, data) => {
        if (!err) {
          resolve(data);
          return cb(err, data);
        } else {
          reject(err);
          return cb(err, false);
        }
      })
      .sort(sort)
      .select(selector)
      .populate(query)
      .skip(skip)
      .limit(limit);
  });
};

const findOne = function ({
  params = {},
  selector = '',
  query = '',
  cb = () => {}
}) { // eslint-disable-line
  return new Promise((resolve, reject) => {
    model.findOne(params, (err, data) => {
        if (!err) {
          resolve(data);
          return cb(err, data);
        } else {
          reject(err);
          return cb(err, false);
        }
      })
      .select(selector)
      .populate(query);
  });

};

const create = function ({
  obj,
  cb = () => {}
}) { // eslint-disable-line
  return new Promise((resolve, reject) => {
    //obj = _.omit(obj, ['_id', 'createdAt', 'loginAt', 'updatedAt', 'unblockAt', 'isBlocked', 'isActive', 'attempts']);
    //obj.createdAt = date.unixTimestamp();
    new model(obj).save((err, data) => {
      if (!err) {
        resolve(data);
        return cb(false, data);
      } else {
        reject(err);
        return cb(err, false);
      }
    });
  });

};

const update = function (query, params, cb) {
  model.update(query, {
    $setOnInsert: params
  }, (err, data) => {
    if (!err) {
      cb(false, data);
    } else {
      cb(err, false);
    }
  });
};

const count = ({
  params,
  cb = () => {}
}) => { // eslint-disable-line
  return new Promise((resolve, reject) => {
    model.count(params, (err, count) => { // eslint-disable-line
      if (!err) {
        resolve(count);
        return cb(err, count);
      } else {
        reject(err);
        return cb(err, false);
      }
    });
  });
};

const remove = function (id) {
  model.remove({
    _id: id
  }, () => { // eslint-disable-line
  });
};

const findOneAndUpdate = function ({
  query = {},
  params = {},
  cb = () => {}
}) { // eslint-disable-line
  return new Promise((resolve, reject) => {
    model.findOneAndUpdate(query, params, {
      new: true
    }, (err, data) => {
      if (!err) {
        resolve(data);
        return cb(err, data);
      } else {
        reject(err);
        return cb(err, false);
      }
    });
  });
};

const findByIdAndUpdate = ({
  id = '',
  data = {},
  options = {},
  cb = () => {}
}) => { // eslint-disable-line
  return new Promise((resolve, reject) => {
    model.findByIdAndUpdate(id, data, options, (err, result) => {
      if (!err) {
        resolve(result);
        return cb(err, result);
      } else {
        reject(err);
        return cb(err, false);
      }
    });
  });
};

const aggregatePipeline = ({
  match = {},
  group = {},
  cb = () => {}
}) => { // eslint-disable-line
  return new Promise((resolve, reject) => {
    model.aggregate([{
        $match: match
      },
      {
        $group: group
      }
    ]).exec((err, result) => {
      if (!err) {
        resolve(result);
        return cb(err, result);
      } else {
        reject(err);
        return cb(err, false);
      }
    });
  });
};

const deleteSoft = ({
  params = {},
  deletedBy,
  cb = () => {}
}) => {
  return new Promise((resolve, reject) => {
    model.delete(params, deletedBy).exec((err, result) => {
      if (!err) {
        resolve(result);
        return cb(err, result);
      } else {
        reject(err);
        return cb(err, false);
      }
    });
  });
};

const obj = {
  find,
  findOne,
  create,
  update,
  count,
  remove,
  findOneAndUpdate,
  findByIdAndUpdate,
  aggregatePipeline,
  deleteSoft
};

module.exports = obj;
