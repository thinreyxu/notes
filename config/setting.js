var salt = 'notes_pass_salt';
var s = {
  db: 'mongodb',
  salt: salt,
  samUserName: 'thineryxu',
  samUserPass: require('crypto').createHash('sha256').update('jjjjjj' + salt).digest('hex')
}
module.exports = s;