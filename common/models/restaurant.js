var loopback = require('loopback');
var LoopBackContext = require('loopback-context');
var modelUtils = require('../../server/boot/clear-acl.js');
var moment = require('moment');


module.exports = function(Restaurant) {

  // get the restaurant id at /restaurants/restaurantId
  Restaurant.restaurantId = function(cb) {

    var ctx = LoopBackContext.getCurrentContext();
    var currentUser = ctx && ctx.get('currentUser');

    Restaurant.findOne({
      where: {
        userId: currentUser.id
      }
    }, function(err, instance) {
      response = instance.id;
      cb(null, response);
    });
  };

  Restaurant.remoteMethod(
    'restaurantId', {
      http: {
        path: '/restaurantId',
        verb: 'get'
      },
      returns: {
        arg: 'restaurantId',
        type: 'string'
      }
    }
  );

  // a method to check if a similar restaurant exists when registering a new restaurant
  Restaurant.checkRestaurant = function(address, zipcode, cb) {

    Restaurant.findOne({
      where: {
        address: address,
        zipcode: zipcode
      }
    }, function(err, instance) {
      if (instance) {
        response = true;
      } else {
        response = false;
      }
      cb(null, response);
    });
  };

  Restaurant.remoteMethod(
    'checkRestaurant', {
      http: {
        path: '/checkRestaurant',
        verb: 'get'
      },
      accepts: [{
        arg: 'address',
        type: 'string',
        http: {
          source: 'query'
        }
      }, {
        arg: 'zipcode',
        type: 'number',
        http: {
          source: 'query'
        }
      }],
      returns: {
        arg: 'checkRestaurant',
        type: 'boolean'
      }
    }
  );

  // check if the restaurant is open or closed
  Restaurant.openOrClosed = function(restaurantId, cb) {

    var now = moment();
    var today = moment().format("dddd");
    var day = today;

    Restaurant.findById(restaurantId, function(err, instance) {

      if (instance.workFrom[today]) {
        var workingFrom = moment(instance.workFrom[today]);
        var workingTo = moment(instance.workTo[today]);

        if (now.isBefore(workingFrom) || now.isAfter(workingTo)) {
          openOrClosed = "Closed";
        } else {
          openOrClosed = "Open";
        }
      } else {
        openOrClosed = "Closed";
      }

      cb(null, day, openOrClosed);
    });
  };

  Restaurant.remoteMethod(
    'openOrClosed', {
      http: {
        path: '/:restaurantId/openOrClosed',
        verb: 'get'
      },
      accepts: {
        arg: 'restaurantId',
        type: 'string',
        required: true
      },
      returns: [{
        arg: 'day',
        type: 'string'
      }, {
        arg: 'openOrClosed',
        type: 'string'
      }]
    }
  );

};
