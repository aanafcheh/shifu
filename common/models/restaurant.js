var loopback = require('loopback');
var LoopBackContext = require('loopback-context');

module.exports = function(Restaurant) {



  // get the restaurant id at /restaurants/restaurantId
  // Restaurant.restaurantId = function(cb) {
  //
  //   var ctx = LoopBackContext.getCurrentContext();
  //   var currentUser = ctx && ctx.get('currentUser');
  //
  //   Restaurant.findOne({
  //     where: {
  //       userId: currentUser.id
  //     }
  //   }, function(err, instance) {
  //     response = instance.id;
  //     cb(null, response);
  //   });
  // };
  //
  // Restaurant.remoteMethod(
  //   'restaurantId', {
  //     http: {
  //       path: '/restaurantId',
  //       verb: 'get'
  //     },
  //     returns: {
  //       arg: 'restaurantId',
  //       type: 'string'
  //     }
  //   }
  // );

  // a method to check if a similar restaurant exists when registering a new restaurant
  // Restaurant.checkRestaurant = function(address, zipcode, cb) {
  //
  //   Restaurant.findOne({
  //     where: {
  //       address: address,
  //       zipcode: zipcode
  //     }
  //   }, function(err, instance) {
  //     if (instance) {
  //       response = true;
  //     } else {
  //       response = false;
  //     }
  //     cb(null, response);
  //   });
  // };
  //
  // Restaurant.remoteMethod(
  //   'checkRestaurant', {
  //     http: {
  //       path: '/checkRestaurant',
  //       verb: 'get'
  //     },
  //     accepts: [{
  //       arg: 'address',
  //       type: 'string',
  //       http: {
  //         source: 'query'
  //       }
  //     }, {
  //       arg: 'zipcode',
  //       type: 'number',
  //       http: {
  //         source: 'query'
  //       }
  //     }],
  //     returns: {
  //       arg: 'checkRestaurant',
  //       type: 'boolean'
  //     }
  //   }
  // );

  // check if the restaurant is open or closed
  Restaurant.openOrClosed = function(restaurantId, cb) {


    var days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    var now = new Date();
    // get the current time and current day of the week
    // toTimeString is used here so that we only compare the times and ignore the dates
    var currentTime = now.toTimeString();
    var today = days[now.getDay()];

    Restaurant.findById(restaurantId, function(err, instance) {

      if (instance.workFrom[today]) {
        var workingFrom = instance.workFrom[today].toTimeString();
        var workingTo = instance.workTo[today].toTimeString();
        if (currentTime < workingFrom || currentTime > workingTo) {
          openOrClosed = "Closed";
        } else {
          openOrClosed = "Open";
        }
      } else {
        openOrClosed = "Closed";
      }
      cb(null, today, openOrClosed);
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
        arg: 'today',
        type: 'string'
      }, {
        arg: 'openOrClosed',
        type: 'string'
      }]
    }
  );

};
