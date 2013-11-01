var util = require('util');
var db = require('./db-sqlite3');

module.exports = Note;

function Note () {}

Note.emptyNote = {
  ts: '',
  title: '',
  note: ''
};

Note.add = function (title, note, callback) {
  var newNote = {
    ts: new Date(),
    title: title,
    note: note
  };
  db.db.run(
    'INSERT INTO notes (ts, title, note) VALUES (?, ?, ?);',
    [newNote.ts, title, note],
    function (err) {
      if (err) {
        util.log('FAIL to add ' + err);
        return callback(err);
      }
      callback(null, newNote);
    }
  );
};

Note.delete = function (ts, callback) {
  db.db.run(
    'DELETE FROM notes WHERE ts = ?;',
    [ts],
    function (err) {
      err && util.log('FAIL to delete ' + err);
      callback(err);
    }
  );
};

Note.edit = function (ts, title, note, callback) {
  db.db.run(
    'UPDATE notes SET title = ?, note = ? WHERE ts = ?;',
    [title, note, ts],
    function (err) {
      err && util.log('FAIL on updating table ' + err);
      callback(err);
    }
  );
};

Note.all = function (callback) {
  util.log(' in allNotes');
  db.db.all('SELECT * FROM notes', callback);
};

Note.each = function (each, callback) {
  db.db.each('SELECT * FROM notes', function (err, row) {
    if (err) {
      util.log('FAIL to retrieve row ' + err);
      callback(err, null); // 这里为什么要传递两个参数
    }
    else {
      each(null, row); // no error
    }
  }, callback);
}

Note.findById = function (ts, callback) {
  var didOne = false;
  db.db.each(
    'SELECT * FROM notes WHERE ts = ?',
    [ts],
    function (err, row) {
      if (err) {
        util.log('FAIL to retireve row ' + err);
        return callback(err, null);
      }
      if (!didOne) {
        callback(null, row);
        didOne = true;
      }
    }
  );
};