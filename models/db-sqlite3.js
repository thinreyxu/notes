var util = require('util');
var sqlite3 = require('sqlite3');

sqlite3.verbose(); // TODO

var db;

exports.connect = function (callback) {
  exports.db = db = new sqlite3.Database(__dirname + '/../db/notes-sqlite3', sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE,
    function (err) {
      if (err) {
        util.log('FAIL on create database ' + err);
        callback && callback(err);
      }
      else {
        callback && callback(null, db);
      }
    })
};

exports.disconnect = function (callback) {
  exports.db = db = null;
  callback && callback(null);
};

exports.setup = function (callback) {
  db.run(
    'CREATE TABLE IF NOT EXISTS notes (ts DATETIME, author VARCHAR(255), note TEXT)',
    function (err) {
      if (err) {
        util.log('FAIL on creating table ' + err);
        callback && callback(err);
      }
      else {
        callback && callback(null);
      }
    }
  );
};