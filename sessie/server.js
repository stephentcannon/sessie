if(Meteor.is_server) {
  
  Meteor.startup(function () {
  _.each(['sessie_sessions', 'sessie_session_data'], function(collection) {
    _.each(['insert', 'update', 'remove'], function(method) {
      Meteor.default_server.method_handlers['/' + collection + '/' + method] = function() {};
      });
    });
  });

  Sessie = {}
  Sessie.Sessions = new Meteor.Collection('sessie_sessions');

  Sessie.expires = 3; //Days
  Sessie.encryption_password = "mak3th1sd1ff1cult";

  //PRIVATE - Deletes a Session & Session Objects
  Sessie.delete = function(id) {
    Sessie.Sessions.remove({id: id});
    return true;
  };

  //PRIVATE - SERVERS SIDE ONLY jit session clean up
  Sessie.cleanUp = function() {
    now = new Date();
    Sessie.Sessions.remove({expires: {$lt: now}})
  };

  Meteor.methods({
    Sessie_session_start: Sessie_session_start,
    Sessie_session_validate: Sessie_session_validate
  });
  
  //EXPOSED - SERVER SIDE 
  function Sessie_session_start() {
    this.unblock();
    var expires = new Date();
    expires.setDate(expires.getDate()+Sessie.expires);
    var uuid = Meteor.uuid();
    var hash = CryptoJS.HmacSHA512(uuid, Sessie.encryption_password); 
    var key = hash.toString(CryptoJS.enc.Hex);
    id = Sessie.Sessions.insert({ 
      created: new Date(), 
      expires: expires,
      key_id: uuid
    });
    if(id){
      return {session_id: id, session_key: key, expires: Sessie.expires};        
    }else{
      throw new Meteor.Error(500, 'Internal Server Error. Session creation failed.');
    }  
  };

  //EXPOSED - SERVER SIDE
  function Sessie_session_validate(session) {
    // TODO maybe a new uuid and key on each request? 
    //  would require flip flop of id and session_id functionality
    this.unblock();
    if(serverSession = Sessie.Sessions.findOne({
      _id: session.session_id
      })) 
    {
      now = new Date();
      if(serverSession.expires < now) {
        Sessie.cleanUp();
        throw new Meteor.Error(401.2, 'Session expired');
        return false;
      } else {
        var hash = CryptoJS.HmacSHA512(serverSession.key_id, Sessie.encryption_password); 
        var test_key = (hash.toString(CryptoJS.enc.Hex));
        if(test_key === session.session_key){
          return true;
        } else {
          throw new Meteor.Error(401.3, 'Invalid session key');
          return false;
        }
      }
    } else {
      throw new Meteor.Error(401.1, 'Invalid session');
      return false;
    }
  };
}