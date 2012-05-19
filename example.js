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
}