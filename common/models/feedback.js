


var app = require('../../server/server.js');
// access mongo connector - MongoDB is the name of the datasource specified in datgasource.json
var mongoConnector = app.datasources.MongoDB.connector;
// define the ObjectId, so that we can use $match based on a field's id or foreign key as the ids
var ObjectId = require('mongodb').ObjectID;



module.exports = function(Feedback) {


  // get the average feedback of a restaurant
  Feedback.avgFeedback = function(restaurantId, cb) {

    mongoConnector.connect(function(err, db) {
      var feedbackCollection = db.collection('feedback');
      var restaurantCollection = db.collection('restaurant');

      var results = feedbackCollection.aggregate([{
        $match: {
          restaurantId: ObjectId(restaurantId)
        }
      }, {
        $group: {
          _id: "$restaurantId",
          avgRate: {
            $avg: "$rate"
          }
        }
      }], function(err, data) {

        var response;
        // if the user has not rated yet, then an empty array is returned, so we have to make sure that we have the average by checking that the array is not empty
        if (data.length > 0) {
          response = data[0].avgRate;
        }
        else {
          console.log(data);
        }

        // insert or update the avgRate field of the restaurant
        restaurantCollection.update({
          _id: ObjectId(restaurantId)
        }, {
          $set: {
            avgRate: response
          }
        });

        cb(null, response);
      });
    });
  };

  Feedback.remoteMethod(
    'avgFeedback', {
      http: {
        path: '/:restaurantId/avgFeedback',
        verb: 'get'
      },
      accepts: {
        arg: 'restaurantId',
        type: 'string',
        required: true
      },
      returns: {
        type: 'object',
        root: true
      }
    }
  );

};
