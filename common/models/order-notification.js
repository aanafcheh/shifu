'use strict';
var events = require('events');
var eventEmitter = new events.EventEmitter();



module.exports = function(Ordernotification) {
  Ordernotification.notificationPolling= function(containerId,cb){
    var timeout=setTimeout(function(){
      cb(null,"");
      console.log("tiime out");
    },30000);
    var listener=function(){
      eventEmitter.once('newOrder',function(newNotification){
        //clearTimeout(timeout);
        console.log(newNotification.notificationsContainerId + " "+ containerId);
         cb(null,newNotification);

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
    Ordernotification.create({"notificationsContainerId":req.body.id,'quantity':req.body.quantity,'itemId':req.body.itemId,'customerId':req.body.customerId},function(err,data){
      eventEmitter.emit("newOrder",data);
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
