var util = require('util')
  , mongoose = require('mongoose')
  , Schema = mongoose.Schema;

var NoteSchema = new Schema({
  ts: { type: Date, default: Date.now },
  title: String,
  note: String
});

mongoose.model('Note', NoteSchema);
var Note = mongoose.model('Note');

exports.emptyNote = {
  _id: '',
  title: '',
  note: ''
};

exports.add = function (title, note, callback) {
  var newNote = new Note();
  newNote.title = title;
  newNote.note = note;
  newNote.save(function (err) {
    if (err) {
      util.log('FATAL ' + err);
      return callback(err);
    }
    callback(null, newNote);
  });
};

exports.delete = function (id, callback) {
  findById(id, function (err, doc) {
    if (err) {
      util.log('FAIL ' + err);
      return callback(err);
    }
    util.log(util.inspect(doc));
    doc.remove();
    callback(null);
  })
};

exports.edit = function (id, title, note, callback) {
  findById(id, function (err, doc) {
    if (err) {
      util.log('FAIL ' + err);
      return callback(err);
    }
    doc.ts = new Date();
    doc.title = title;
    doc.note = note;
    doc.save(function (err) {
      if (err) {
        util.log('FAIL ' + err);
        return callback(err);
      }
      callback(null);
    });
  });
};

exports.all = function (callback) {
  Note.find({}, callback);
};

exports.each = function (each, callback) {
  Note.find({}, function (err, docs) {
    if (err) {
      util.log('FAIL ' + err);
      return callback(err);
    }
    docs.forEach(function (doc) {
      each(null, doc);
    });
    callback(null);
  });
};

exports.findById = findById;
function findById (id, callback) {
  Note.findOne({_id: id}, function (err, doc) {
    if (err) {
      util.log('FAIL ' + err);
      return callback(err);
    }
    callback(null, doc);
  });
};