'use strict';
var events = require('events');
var eventEmitter = new events.EventEmitter();



module.exports = function(Ordernotification) {
  Ordernotification.notificationPolling= function(containerId,cb){
    var listener=function(){
      eventEmitter.once('newOrder',function(data){
       if(containerId===data){
         cb(null,data);
       }

      });
    };

    listener();

  }

  Ordernotification.remoteMethod(
    'notificationPolling', {
      http: {
        path: '/notification/:containerId',
        verb: 'get'
      },

      accepts: {
        arg: 'containerId',
        type: 'string'
      },
      returns: {
        type: 'object',
        root: true
      }
    }
  );

  Ordernotification.notificationPost=function(req,cb){
    console.log("The obj" );

    Ordernotification.create({"notificationsContainerId":req.body.id,'quantity':req.body.quantity,'itemId':req.body.itemId,'customerId':req.body.customerId},function(err,data){
      eventEmitter.emit("newOrder",req.body.id);
      cb(null,data);
    });

  }
  Ordernotification.remoteMethod(
    'notificationPost', {
      http: {
        path: '/notification/',
        verb: 'post'
      },
      accepts: {arg: 'obj', type: 'object','http': {source: 'req'}}

    }
  );
};
