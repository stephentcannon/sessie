//this is just for the example application
Users = new Meteor.Collection('Users');

//just tossed this in here so it was available for both example-server.js and example-client.js
//should be in a utils
validateParams = function(params) {
    for (var key in params) {
      value = params[key];
      if(_.isEmpty(value) || _.isUndefined(value) || 
      _.isNull(value)) {
        throw new Meteor.Error(600, 'Please enter your "'+ key + '".');
      }
    }
  };
