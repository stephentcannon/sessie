if(Meteor.is_server) {
  
  Meteor.startup(function () {
  _.each(['sessieSessions'], function(collection) {
    _.each(['insert', 'update', 'remove'], function(method) {
      Meteor.default_server.method_handlers['/' + collection + '/' + method] = function() {};
      });
    });
  });

  Sessie = {}
  Sessie.Sessions = new Meteor.Collection('sessieSessions');

  // TODO CONFIGURATION - CHANGE THIS
  Sessie.expires = 1; //Days
  Sessie.encryption_password = "mak3th1sd1ff1cult";
  Sessie.session_key_timeout = 5; //in minutes, causes new key generation, must always be less than session_timeout
  /*
  * { "created" : ISODate("2012-05-18T22:28:22.517Z"), 
  * "updated" : ISODate("2012-05-18T22:28:22.517Z"),
  * "expires" : ISODate("2012-05-21T22:28:22.499Z"), 
  * "expiry" : 3 //from Sessie.expires
  * "key_id" : "229e5a1a-fb27-4e17-8580-80c67efc9313", 
  * "key" : "asdhf7ehadfuhaksduhfakeufhaksdufasdf",    
  * "_id" : "9ad1a292-7e9e-45f7-82fb-530734f1de01" }   
  */

  Meteor.publish('sessieSessions', function(session) {
    var sessionId = Sessie.validateOrCreateSession(session);
    return Sessie.Sessions.find({ _id: sessionId}, { limit: 1, fields: { key_id: false } });
  });

  Sessie.delete = function(id) {
    Sessie.Sessions.remove({id: id});
    return true;
  };

  Sessie.cleanUp = function() {
    now = new Date();
    Sessie.Sessions.remove({expires: {$lt: now}})
  };

  Sessie.validateOrCreateSession = function(session) {
    var sessionId;
    session = session || {};
    if (session.session_id) {
      if(this.validateSession(session)){
        sessionId = session.session_id;
      } else {
        sessionId = this.createSession();
      }
    } else {
      sessionId = this.createSession();
    }
    return sessionId;
  };

  Sessie.generateKey = function(){
    var key = {};
    key.id = Meteor.uuid();
    var hash = CryptoJS.HmacSHA512(key.id, Sessie.encryption_password); 
    key.key = hash.toString(CryptoJS.enc.Hex); 
    console.log('*** generateKey ***');
    console.log('generateKey key.id: ' + key.id);
    console.log('generateKey key.key: ' + key.key);
    return key;
  }

  Sessie.validateKey = function(key1, key2){
    console.log('*** validateKey ***');
    console.log('key1: ' + key1);
    console.log('key2: ' + key2);
    var hash = CryptoJS.HmacSHA512(key1, Sessie.encryption_password); 
    var test_key = (hash.toString(CryptoJS.enc.Hex));
    console.log('test_key: ' + test_key);
    if(test_key === key2){
      console.log('returning true');
      return true;
    } else {
      console.log('returning false');
      return false;
    }
  }

  Sessie.createSession = function() {
    console.log('*** createSession ***');
    var expires = new Date();
    expires.setDate(expires.getDate()+Sessie.expires);
    var key = this.generateKey();
    id = Sessie.Sessions.insert({ 
      created: new Date(),
      updated: new Date(), 
      expires: expires,
      expiry: Sessie.expires,
      key_id: key.id,
      key: key.key
    });
    if(id){
      return id;      
    }else{
      //throw new Meteor.Error(600, 'Internal Server Error. Session creation failed.');
      return null;
    }  
  };

  Sessie.validateSession = function(session) {
    if(serverSession = Sessie.Sessions.findOne({
      _id: session.session_id
      })) 
    {
      var now = new Date();
      var session_key_timeout = new Date();
      console.log('*** validateSession ***');
      console.log('now: ' + now);
      //var session_key_timeout = new Date(now - (Sessie.session_key_timeout * 60000));
      session_key_timeout.setMinutes(now.getMinutes() - Sessie.session_key_timeout);
      console.log('session_key_timeout: ' + session_key_timeout);
      console.log('serverSession.expires: ' + serverSession.expires);
      console.log('serverSession.updated: ' + serverSession.updated);
      if(serverSession.expires < now) {
        //session expired
        Sessie.cleanUp();
        return false;
      } else {
        if(this.validateKey(serverSession.key_id, session.session_key)){
          //TODO session_key_timeout
          var expires = new Date();
          expires.setDate(expires.getDate()+Sessie.expires);
          Sessie.Sessions.update({_id: session.session_id}, 
            {$set: {
            expires: expires, 
            expiry: Sessie.expires,
            updated: new Date()
          }});
          return true;
        } else {
          Sessie.delete(session.session_id);
          //TODO invalid session credentials on client, maybe tampered with TEST ME
          console.log('invalid session key validation failed');
          return false;
        }
      }
    } else {
      //TODO session not found in database
      console.log('session not found in database');
      return false;
    }
  };

}