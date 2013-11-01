var s = require('../config/setting');

User = function () {}

var samUser = {
  name: s.samUserName,
  pass: s.samUserPass
};

User.getById = function (id, callback) {
  callback(null, samUser);
}

module.exports = User;