var ensureLoggedIn = require('connect-ensure-login').ensureLoggedIn;

module.exports = function(app) {

  var User = app.models.user;

  app.get('/', function(req, res, next) {
      res.render('index', {
        user: req.user,
        url: req.url,
      });
  });

  // show when the user verified their email
  app.get('/verified', function(req, res) {
    res.render('verified-email');
  });

  // send back the user info to the front end, this info is stored in AppAuth factory as AppAuth.currentUser
  app.get('/auth/current', function(req, res, next) {
    if (!req.isAuthenticated || !req.isAuthenticated()) {
      return res.status(200).json({});
    }
    var ret = JSON.parse(JSON.stringify(req.user));
    delete ret.password;
    res.status(200).json(ret);
  });

  // when the scial login fails riderect to a login page
  // TODO: add login limit and report to the user owner if someone logs in too many times
  app.get('/login', function(req, res, next) {
    res.render('login-error', {
      user: req.user,
      url: req.url
    });
  });

  // logout
  app.get('/logout', function(req, res, next) {
    if (!req.accessToken) {
      req.logout();
      res.redirect('/');
    }
    else {
      User.logout(req.accessToken.id, function(err) {
        if (err) return next(err);
        req.logout();
        res.redirect('/');
      });
    }
  });

};
