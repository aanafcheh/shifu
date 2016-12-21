var config = require('../../server/config.json');
var path = require('path');
var modelUtils = require('../../server/boot/clear-acl.js');

module.exports = function(User) {

  // clear base ACLs and use user applied ACLs
  modelUtils.clearBaseACLs(User, require('./user.json'));

  // TODO: why this is not getting trigerred
  User.validatesLengthOf('password', {min: 6, message: {min: 'Password is too short'}});

  //send verification email after registration
  User.afterRemote('create', function(context, user, next) {

    var options = {
      type: 'email',
      protocol: 'http',
      host: 'localhost',
      to: user.email,
      from: 'shifupandadumplings@gmail.com',
      subject: 'Verify your email address',
      template: path.resolve(__dirname, '../../client/email-template.html'),
      redirect: '/verified',
      user: user,
      name: user.name,
      text: '{href}'
    };

    user.verify(options, function(err, response) {
      if (err) {
        User.deleteById(user.id);
        return next(err);
      }

      context.res.render('index');
    });
  });

};
