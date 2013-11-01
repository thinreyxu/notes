var express = require('express')
  , http = require('http');

var s = require('./config/setting');
var db = require('./models/db-' + s.db);
var routes = require('./routes');

var app = express();

app.set('dbEngine', s.db);
app.set('port', process.env.PORT || 3000)
app.set('views', __dirname + '/views');
app.set('view engine', 'jade');

app.use(require('connect-flash')()); //flash 是需要 session 的
app.use(express.favicon());
app.use(express.logger('dev'));
// app.use(express.bodyParser()); // 在 connect-3.0 中废弃了
app.use(express.urlencoded());
app.use(express.json());
app.use(express.cookieParser());
app.use(express.session({
  secret: 'notes-session-secret',
  key: 'sid',
  cookie: {
    maxAge: 86400000 * 30
  }
}));

app.use(app.router);
app.use(require('stylus').middleware(__dirname + '/public'));
app.use(express.static(__dirname + '/public'));

app.use(function (err, req, res, next) {
  console.log(err);
  req.flash('error', err);
  res.render('error', {
    title: 'Error',
    error: req.flash('error'),
    success: req.flash('success')
  });
  // next && next();
});

if ('development' === app.get('env')) {
  app.use(express.errorHandler());
}

routes(app);

var server = http.createServer(app).listen(app.get('port'), function () {
  console.log('Server listening on port ' + app.get('port'));
}).on('close', function (err) {
  console.log('Server stoped!');
  require('./models/db-' + app.get('dbEngine')).disconnect();
});

db.connect(function (err) {
  if (err) {
    req.flash('error', err);
    return res.send('500');
  }
});