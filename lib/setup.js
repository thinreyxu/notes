var util = require('util')
  , async = require('async');

var s = require('../config/setting');

var db = require('../models/db-' + s.db)
  , note = require('../models/note-' + s.db);

db.connect(function (err) {
  if (err) {
    throw err;
  }
});

db.setup(function (err) {
  if (err) {
    util.log('ERROR ' + err);
    throw err;
  }
  async.series(
    [
      function (callback) {
        note.add('Couchist', 'Lorem ipsum dolor sit amet, consectetur adipisicing elit. Aut, aliquam delectus laborum debitis nemo atque sit excepturi veritatis magnam consequuntur.',
          function (err) {
            if (err) util.log('ERROR ' + err);
            callback(err);
          }
        );
      }
    ],
    function (err, results) {
      if (err) util.log('ERROR ' + err);
      db.disconnect();
    }
  );
});