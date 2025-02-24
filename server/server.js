var loopback = require('loopback');
var app = module.exports = loopback();
var boot = require('loopback-boot');

var path = require('path');
var bodyParser = require('body-parser');
var flash = require('express-flash');
var cookieParser = require('cookie-parser');
var session = require('express-session');

//put the current user in the current context so it is accessable by remote methods
// var LoopBackContext = require('loopback-context');
// app.use(LoopBackContext.perRequest());
// app.use(loopback.token());
// app.use(function setCurrentUser(req, res, next) {
//   if (!req.accessToken) {
//     return next();
//   }
//   app.models.user.findById(req.accessToken.userId, function(err, user) {
//     if (err) {
//       return next(err);
//     }
//     if (!user) {
//       return next(new Error('No user with this access token was found.'));
//     }
//     var loopbackContext = LoopBackContext.getCurrentContext();
//     if (loopbackContext) {
//       loopbackContext.set('currentUser', user);
//     }
//     next();
//   });
// });

// view engine
app.set('views', path.join(__dirname, '../client'));
app.engine('html', require('ejs').renderFile);
app.set('view engine', 'html');

// Bootstrap the application, configure models, datasources and middleware.
// Sub-apps like REST API are mounted via boot scripts.
boot(app, __dirname, function(err) {
  if (err) throw err;
});

app.start = function() {
  // start the web server
  return app.listen(function() {
    app.emit('started');
    var baseUrl = app.get('url').replace(/\/$/, '');
    console.log('Web server listening at: %s', baseUrl);
    if (app.get('loopback-component-explorer')) {
      var explorerPath = app.get('loopback-component-explorer').mountPath;
      console.log('Browse your REST API at %s%s', baseUrl, explorerPath);
    }
  });
};

// start the server if `$ node server.js`
if (require.main === module) {
  app.start();
}
