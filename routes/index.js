var crypto = require('crypto')
  , s = require('../config/setting')
  , User = require('../models/user');

module.exports = function (app) {

  var db = require('../models/db-' + app.get('dbEngine'))
    , Note = require('../models/note-' + app.get('dbEngine'));


  function checkLogin (req, res, next) {
    if (!req.session.user) {
      return res.redirect('/login')
    }
    next();
  }

  function checkNotLogin (req, res, next) {
    if (req.session.user) {
      return res.redirect('/');
    }
    next();
  }

/*  app.all('*', function (req, res, next) {
    console.log(req.session);
    console.log('Referrer: ' + req.headers.referer);
    console.log('Accept: ' + req.headers.accept);
    next();
  });*/

  app.get('/', function (req, res) {
    res.redirect('/note');
  });

  app.get('/note', function (req, res) {
    Note.all(function (err, notes) {
      if (err) {
        req.flash('error', err);
        notes = [];
      }
      res.render('notes', {
        title: '便签',
        error: req.flash('error').toString(),
        success: req.flash('success').toString(),
        notes: notes,
        user: req.session.user
      });
    });
  });

  app.get('/note/:id', function (req, res) {
    Note.findById(req.params.id, function (err, note) {
      if (err) {
        req.flash('error', err);
        return res.redirect('/note');
      }
      res.render('note', {
        title: '便签',
        error: req.flash('error').toString(),
        success: req.flash('success').toString(),
        note: note,
        user: req.session.user
      });
    });
  });

  app.get('/add', checkLogin, function (req, res) {
    res.render('edit', {
      title: '添加新便签',
      error: req.flash('error').toString(),
      success: req.flash('success').toString(),
      postPath: '/add',
      user: req.session.user
    });
  });

  app.post('/add', checkLogin, function (req, res) {
    var title = req.body.title
      , note = req.body.note;

    Note.add(title, note, function (err, note) {
      if (err) {
        req.flash('error', err);
        return res.redirect('/note');
      }
      res.redirect('/note/' + note._id || note.ts.getTime());
    });
  });

  app.get('/edit/:id', checkLogin, function (req, res) {
    Note.findById(req.params.id, function (err, note) {
      if (err) {
        req.flash('error', err);
        return res.redirect('/note');
      }
      res.render('edit', {
        title: '编辑便签',
        error: req.flash('error').toString(),
        success: req.flash('success').toString(),
        postPath: '/edit/' + req.params.id,
        note: note,
        user: req.session.user
      });
    });
  });

  app.post('/edit/:id', checkLogin, function (req, res) {
    var ts = req.params.id
      , title = req.body.title
      , note = req.body.note;
    
    Note.edit(ts, title, note, function (err) {
      if (err) {
        req.flash('error', err);
      }
      res.redirect('/note/' + ts);
    })
  });

  app.get('/delete/:id', checkLogin, function (req, res) {
    Note.delete(req.params.id, function (err) {
      if (err) {
        req.flash('error', err);
        res.redirect('back');
      }
      res.redirect('/note');
    })
  });

  app.get('/login', checkNotLogin, function (req, res) {
    res.render('login', {
      title: '登录',
      error: req.flash('error').toString(),
      success: req.flash('success').toString(),
      user: req.session.user
    })
  });

  app.post('/login', checkNotLogin, function (req, res) {
    var salt = s.salt
      , name = req.body.name
      , pass = req.body.pass;

    pass = crypto.createHash('sha256').update(pass + salt).digest('hex');

    User.getById('fake_id', function (err, user) {
      if (err) {
        req.flash('error', err.toString());
        return res.redirect('/login');
      }
      if (!user || pass !== user.pass) {
        req.flash('error', '用户名或密码错误');
        return res.redirect('/login');
      }
      req.session.user = user;
      req.flash('success', '登录成功');
      res.redirect('/');
    });
  });

  app.get('/logout', checkLogin, function (req, res) {
    req.session.user = null;
    res.redirect('/');
  });
};