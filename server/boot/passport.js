var PassportConfigurator = require('loopback-component-passport').PassportConfigurator;

module.exports = function(app) {

  // attempt to build the providers/passport config
  var config = {};
  try {
    config = require('../../providers.json');
  } catch (err) {
    console.trace(err);
    process.exit(1); // fatal
  }

  // initalize passport
  var passportConfigurator = new PassportConfigurator(app);
  passportConfigurator.init();

  // add the info to the models
  passportConfigurator.setupModels({
    userModel: app.models.user,
    userIdentityModel: app.models.userIdentity,
    userCredentialModel: app.models.userCredential,
  });


  for (var s in config) {
    var c = config[s];
    c.session = c.session !== false;
    passportConfigurator.configureProvider(s, c);
  }

};
