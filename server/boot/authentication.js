var loopback = require('loopback');

module.exports = function enableAuthentication(server) {
  // enable authentication
  server.enableAuth();
};
