var util = require('util');

var s = require('../config/setting')

var db = require('../models/db-' + s.db);
var note = require('../models/note-' + s.db);

db.connect(function (err) {
  if (err) throw err;

  note.each(
    function (err, row) {
      util.log('ROW: ' + util.inspect(row));
    },
    function (err) {
      if (err) throw err;
      util.log('ALL DONE');
      db.disconnect();
    }
  );
});