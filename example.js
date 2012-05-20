if (Meteor.is_client) {

  Template.main.sessionId = function () {
    var session = Sessie.Sessions.findOne();
    if (session) {
      return session._id;
    }
  };

  Template.main.sessionKey = function () {
    var session = Sessie.Sessions.findOne();
    if (session) {
      return session.key;
    }
  };

  Template.main.sessionExpires = function () {
    var session = Sessie.Sessions.findOne();
    if (session) {
      return session.expires;
    }
  };

  Template.main.sessionExpiry = function () {
    var session = Sessie.Sessions.findOne();
    if (session) {
      return session.expiry;
    }
  };

  /**
  Template.SessieLoch.SessieLoch = function() {
      return Sessie.Loch.find();
  };
  Template.main.events = {
    'click #btnLoch': function (event) { 
      console.log('button clicked');
      var params = $('#loch-form').toJSON();
      console.log('params.inputName: ' + params.inputName);
      console.log('params.inputValue: ' + params.inputValue);
      try{
        validateParams(params);
          //session, name, value
          Sessie.setLochData(params.inputName, params.inputValue);
      } catch(error) {
        Alert.setAlert('uh-oh!', error.reason, 'alert-error', 'contact');
      }
    }
  };

  validateParams = function(params) {
    for (var key in params) {
      value = params[key];
      if(_.isEmpty(value) || _.isUndefined(value) || 
      _.isNull(value)) {
       throw new Meteor.Error(600, 'Please enter your "'+ key + '".');
      }
    }
  };
  */
}