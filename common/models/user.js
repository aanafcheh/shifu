var modelUtils = require('../../server/boot/clear-acl.js');

module.exports = function(User) {

  // clear base ACLs and use user applied ACLs
  modelUtils.clearBaseACLs(User, require('./user.json'));
};
