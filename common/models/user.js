var loopback = require('loopback');
var LoopBackContext = require('loopback-context');
var modelUtils = require('../../server/boot/clear-acl.js');

module.exports = function(User) {

  // clear base ACLs and use user applied ACLs
  modelUtils.clearBaseACLs(User, require('./user.json'));


  // check if the user has a restaurant
  // User.hasRestaurant = function(cb) {
  //   var ctx = LoopBackContext.getCurrentContext();
  //   var currentUser = ctx && ctx.get('currentUser');
  //
  //   User.findById(currentUser.id, function (err, instance) {
  //       response = instance.restaurant;
  //       cb(null, response);
  //   });
  // };
  //
  // User.remoteMethod (
  //       'hasRestaurant',
  //       {
  //         http: {path: '/hasRestaurant', verb: 'get'},
  //         returns: {arg: 'hasRestaurant', type: 'boolean'}
  //       }
  //   );
};
