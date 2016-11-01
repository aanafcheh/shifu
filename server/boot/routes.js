var ensureLoggedIn = require('connect-ensure-login').ensureLoggedIn;

module.exports = function(app) {

  // if the user is logged in redirect to profile otherwise redirect to index
  app.get('/', function(req, res, next) {
    if (req.user) {
      res.render('profile', {
        user: req.user,
        url: req.url,
      });
    } else {
      res.render('index', {
        user: req.user,
        url: req.url,
      });
    }
  });

  // app.get('/profile', ensureLoggedIn('/'), function(req, res, next) {
  //   res.render('profile', {
  //     user: req.user,
  //     url: req.url,
  //   });
  // });
  //
  // app.get('/profile.html', ensureLoggedIn('/'), function(req, res, next) {
  //   res.render('profile', {
  //     user: req.user,
  //     url: req.url,
  //   });
  // });

  // app.get('/local', function(req, res, next) {
  //   res.render('pages/local', {
  //     user: req.user,
  //     url: req.url,
  //   });
  // });

  // app.get('/signup', function(req, res, next) {
  //   res.render('pages/signup', {
  //     user: req.user,
  //     url: req.url,
  //   });
  // });

  // app.post('/signup', function(req, res, next) {
  //   var User = app.models.user;
  //
  //   var newUser = {};
  //   newUser.email = req.body.email.toLowerCase();
  //   newUser.username = req.body.username.trim();
  //   newUser.password = req.body.password;
  //
  //   User.create(newUser, function(err, user) {
  //     if (err) {
  //       req.flash('error', err.message);
  //       return res.redirect('back');
  //     } else {
  //       // Passport exposes a login() function on req (also aliased as logIn())
  //       // that can be used to establish a login session. This function is
  //       // primarily used when users sign up, during which req.login() can
  //       // be invoked to log in the newly registered user.
  //       req.login(user, function(err) {
  //         if (err) {
  //           req.flash('error', err.message);
  //           return res.redirect('back');
  //         }
  //         return res.redirect('/auth/account');
  //       });
  //     }
  //   });
  // });

  app.get('/login', function(req, res, next) {
    res.render('login-error', {
      user: req.user,
      url: req.url,
    });
  });

  app.get('/logout', function(req, res, next) {
    req.logout();
    res.redirect('/');
  });
};
