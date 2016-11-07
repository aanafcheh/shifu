
var loopback = require('loopback');
var LoopBackContext = require('loopback-context');
var modelUtils = require('../../server/boot/clear-acl.js');
var moment = require('moment');


module.exports = function(Restaurant) {

  // get the restaurant id at /restaurants/restaurantId
  Restaurant.restaurantId = function(cb) {

    var ctx = LoopBackContext.getCurrentContext();
    var currentUser = ctx && ctx.get('currentUser');

    Restaurant.findOne({where: {userId: currentUser.id}}, function (err, instance) {
        response = instance.id;
        cb(null, response);
    });
  };

  Restaurant.remoteMethod (
        'restaurantId',
        {
          http: {path: '/restaurantId', verb: 'get'},
          returns: {arg: 'restaurantId', type: 'string'}
        }
    );

    // a method to check if a similar restaurant exists when registering a new restaurant
    Restaurant.checkRestaurant = function(address, zipcode, cb) {

      Restaurant.findOne({where: {address: address, zipcode: zipcode}}, function (err, instance) {
          if (instance) {
            response = true;
          }
          else {
            response = false;
          }
          cb(null, response);
      });
    };

    Restaurant.remoteMethod (
          'checkRestaurant',
          {
            http: {path: '/checkRestaurant', verb: 'get'},
            accepts: [
              {arg: 'address', type: 'string', http: { source: 'query' } },
              {arg: 'zipcode', type: 'number', http: { source: 'query' } }
            ],
            returns: {arg: 'checkRestaurant', type: 'boolean'}
          }
      );

      // check if the restaurant is open or closed
      Restaurant.openOrClosed = function(restaurantId, cb) {

        var now = moment().format("H:mm:ZZ");
        var timeNow = moment(now,"H:mm:ZZ");

        Restaurant.findById(restaurantId, function (err, instance) {
          var workingFrom= moment(instance.workFrom,"H:mm:ZZ");
          var workingTo= moment(instance.workTo,"H:mm:ZZ");

          if(timeNow.isBefore(workingFrom) || timeNow.isAfter(workingTo)) {
            response ="Closed";
          }
          else{
            response = "Open";
          }

          cb(null, response);
        });
      };

      Restaurant.remoteMethod (
            'openOrClosed',
            {
              http: {path: '/:restaurantId/openOrClosed', verb: 'get'},
              accepts: {arg: 'restaurantId', type: 'string', required: true},
              returns: {arg: 'openOrClosed', type: 'string'}
            }
        );
};
