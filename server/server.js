var loopback = require('loopback');
var boot = require('loopback-boot');
var path = require('path');
var flash = require('express-flash');
var PassportConfigurator = require('loopback-component-passport').PassportConfigurator;

var app = module.exports = loopback();



// We need flash messages to see passport errors
app.use(flash());

// view engine
app.set('views', path.join(__dirname, '../client'));
app.engine('html', require('ejs').renderFile);
app.set('view engine', 'html');

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


// Bootstrap the application, configure models, datasources and middleware.
// Sub-apps like REST API are mounted via boot scripts.

boot(app, __dirname, function(err) {
  if (err) throw err;
  // The access token is only available after boot
  app.middleware('auth', loopback.token({

    model: app.models.accessToken,
    // specify the name of the logged in user id
    currentUserLiteral: 'me'
  }));


  // start the server if `$ node server.js`
  if (require.main === module)
    app.start();
});
