var mongoose = require('mongoose')
  , dburl = 'mongodb://localhost/notes';

exports.connect = function (callback) {
  mongoose.connect(dburl);
  callback(null);
};

exports.disconnect = function (callback) {
  mongoose.disconnect(callback);
}

exports.setup = function (callback) {
  callback(null);
};

