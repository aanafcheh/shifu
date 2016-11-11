module.exports = function(Feedback) {

  // calculate each restaurants feedback after searching for a restaurant using the searchbox
  Feedback.averageFeedback = function(restaurantId, cb) {

    var averageFeedback = 0;

    Feedback.find({
      where: {
        restaurantId: restaurantId,
      },
      fields: {
        rate: true
      }
    }, function(err, instance) {

      // TODO: find a way so that the values do not need to be summed everytime
      // TODO: feedback average is incomplete
      instance.forEach(function(results) {
        results = results.toJSON();
        averageFeedback += results.rate;
      });

      response = averageFeedback/instance.length;
      cb(null, response);
    });
  };

  Feedback.remoteMethod(
    'averageFeedback', {
      http: {
        path: '/averageFeedback',
        verb: 'get'
      },
      accepts: {
        arg: 'restaurantId',
        type: 'string',
        http: {
          source: 'query'
        }
      },
      returns: {
        type: 'array',
        root: true
      }
    }
  );

};
