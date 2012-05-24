//even though this is in a /server/ directory we are going to keep it wrapped just in case.
if(Meteor.is_server) {
  
  Meteor.startup(function () {
  _.each(['sessieSessions', 'sessieLoch'], function(collection) {
    _.each(['insert', 'update', 'remove'], function(method) {
      Meteor.default_server.method_handlers['/' + collection + '/' + method] = function() {};
      });
    });
  });

  // CONFIGURATION
  // Your application can change this by hosting a sessie_config.js with these settings.
  Sessie.expires = 3; //Days
  Sessie.encryption_password = "mak3th1sd1ff1cult";
  Sessie.session_key_timeout = 60; //in minutes, causes new key generation, must always be less than session_timeout

  /*
  * { "created" : ISODate("2012-05-18T22:28:22.517Z"), 
  * "updated" : ISODate("2012-05-18T22:28:22.517Z"),
  * "expires" : ISODate("2012-05-21T22:28:22.499Z"), 
  * "expiry" : 3 //from Sessie.expires
  * "key_id" : "229e5a1a-fb27-4e17-8580-80c67efc9313", 
  * "key" : "asdhf7ehadfuhaksduhfakeufhaksdufasdf",    
  * "_id" : "9ad1a292-7e9e-45f7-82fb-530734f1de01" }   
  */
  /*  session object structure from client through subscription
  * session.session_id
  * session.session_key
  */

  Meteor.publish('sessieSessions', function(session, seed) {
    console.log('*** Meteor.publish sessieSessions ***');
    console.log('*** Meteor.publish seed: ' + seed);
    var sessionId = Sessie.validateOrCreateSession(session, seed);
    return SessieSessions.find({ _id: sessionId}, { limit: 1, fields: { key_id: false, seed: false } });
  });

  /* sessieLoch - where Sessie stores session data
  * { "created" : ISODate("2012-05-18T22:28:22.517Z"), 
  * "updated" : ISODate("2012-05-18T22:28:22.517Z"),
  * "session_id" : "229e5a1a-fb27-4e17-8580-80c67efc9313", 
  * "name" : "firstName",    
  * "value" : "John" }   
  * or anything really
  */
  Meteor.publish('sessieLoch', function(session){
    console.log('*** Meteor.publish sessieLoch ***');
    console.log('session: ' + JSON.stringify(session, 0, 4));
    //TODO add security
    return SessieLoch.find({session_id: session._id});
  });
  
  Sessie.delete = function(id) {
    // TODO pass session_id to Monster to clean up colleciton items IF turned on.
    console.log('*** Sessie.delete sessieLoch ***');
    SessieLoch.remove({session_id: id});
    SessieSessions.remove({_id: id});
    return true;
  };

  Sessie.cleanUp = function() {
    console.log('*** Sessie.cleanUp sessieLoch ***');
    now = new Date();
    // TODO get collection of expired sessions to handle the two TODOs below.
    // TODO delete expired session Loch data
    // TODO pass session_id to Monster to clean up colleciton items IF turned on.
    SessieSessions.remove({expires: {$lt: now}})
  };

  Sessie.validateOrCreateSession = function(session, seed) {
    console.log('*** validateOrCreateSession ***');
    var sessionId;
    session = session || {};
    if (session.session_id) {
      if(this.validateSession(session, seed)){
        sessionId = session.session_id;
      } else {
        sessionId = this.createSession(seed);
      }
    } else {
      sessionId = this.createSession(seed);
    }
    return sessionId;
  };

  Sessie.generateKey = function(seed){
    console.log('*** generateKey ***');
    var key = {};
    key.id = Meteor.uuid();
    var hash = CryptoJS.HmacSHA512(key.id + seed, Sessie.encryption_password); 
    key.key = hash.toString(CryptoJS.enc.Hex); 
    console.log('generateKey key.id: ' + key.id);
    console.log('generateKey key.key: ' + key.key);
    return key;
  };

  Sessie.validateKey = function(id, key2){
    console.log('*** validateKey ***');
    console.log('id: ' + id);
    console.log('key2: ' + key2);
    var hash = CryptoJS.HmacSHA512(id, Sessie.encryption_password); 
    var test_key = (hash.toString(CryptoJS.enc.Hex));
    console.log('test_key: ' + test_key);
    if(test_key === key2){
      console.log('returning true');
      return true;
    } else {
      console.log('returning false');
      return false;
    }
  };

  Sessie.createSession = function(seed) {
    console.log('*** createSession ***');
    var expires = new Date();
    expires.setDate(expires.getDate()+Sessie.expires);
    var key = this.generateKey(seed);
    id = SessieSessions.insert({ 
      created: new Date(),
      updated: new Date(), 
      expires: expires,
      expiry: Sessie.expires,
      key_id: key.id,
      seed: seed,
      key: key.key
    });
    if(id){
      return id;      
    }else{
      //throw new Meteor.Error(600, 'Internal Server Error. Session creation failed.');
      return null;
    }  
  };

  Sessie.updateSessionKey = function(session, key){
    console.log('*** updateSessionKey ***');
    var expires = new Date();
    expires.setDate(expires.getDate()+Sessie.expires);
    SessieSessions.update({_id: session.session_id}, 
      {$set: {
      expires: expires, 
      expiry: Sessie.expires,
      updated: new Date(),
      key_id: key.id,
      key: key.key
    }},function(error, result){});
  };

  Sessie.updateSessionExpiry = function(session){
    console.log('*** updateSessionExpiry ***');
    var expires = new Date();
    expires.setDate(expires.getDate()+Sessie.expires);
    SessieSessions.update({_id: session.session_id}, 
      {$set: {
      expires: expires, 
      expiry: Sessie.expires,
      updated: new Date()
    }}, function(error, result){});
  };

  Sessie.validateSession = function(session) {
    console.log('*** validateSession ***');
    if(serverSession = SessieSessions.findOne({
      _id: session.session_id
      })) 
    {
      var now = new Date();
      var session_key_timeout = new Date();
      
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
        if(this.validateKey(serverSession.key_id + serverSession.seed, session.session_key)){
          if(serverSession.updated <  session_key_timeout){
            console.log('key timed out');
            var key = this.generateKey();
            this.updateSessionKey(session, key);
          } else {
            console.log('key not timed out');
            var key = {};
            this.updateSessionExpiry(session);
          }
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

  Sessie.getLochData = function(session, name){
    this.unblock;
    console.log('*** getLochData ***');
    if(Sessie.validateSession(session)){
      return SessieLoch.findOne({session_id: session.session_id, name: name});
    }
  };

  //PRIVATE DO NOT EVER EXPOSE
  Sessie.setSessionData = function(session, name, value){
    console.log('*** setLochData ***');
    if(name && value){
      if(Sessie.getLochData(session, name)){
        console.log('*** setLochData updating existing data');
        SessieLoch.update({session_id: session.session_id, name: name}, 
        {$set: {
        updated: new Date(),
        value: value
        }}, function(error, result){
          console.log('error: ' + JSON.stringify(error, 0,4));
          console.log('result: ' + JSON.stringify(result, 0,4));
          if(result){
            return true;
          } else {
            return false;
          }
        });
      } else {
        console.log('*** setLochData inserting new data');
        SessieLoch.insert({ 
        created: new Date(),
        updated: new Date(), 
        session_id: session.session_id,
        name: name,
        value: value
        },function(error, result){
          console.log('error: ' + JSON.stringify(error, 0,4));
          console.log('result: ' + JSON.stringify(result, 0,4));
          if(result){
            return true;
          } else {
            return false;
          }
        });
      }
    }
  }

  //BELOW THIS LINE ARE ALL EXPOSED AKA PUBLIC METEOR METHODS

  //EXPOSED WITH METEOR.METHOD
  Sessie.setLochData = function(session, name, value){
    this.unblock;
    console.log('*** setLochData ***');
    if(Sessie.validateSession(session)){
      console.log('*** setLochData session.session_id: ' + session.session_id);
      console.log('*** setLochData session.session_key: ' + session.session_key);
      console.log('*** setLochData name: ' + name);
      console.log('*** setLochData value: ' + value);
      // TODO only if it is mutable?
      // TODO should probably have callback support for error, result like Meteor does
      Sessie.setSessionData(session, name, value);

    }
  };
  
  //EXPOSED WITH METEOR.METHOD
  Sessie.deleteLochData = function(session, name){
    this.unblock;
    console.log('*** deleteLochData ***');
    if(Sessie.validateSession(session)){
      SessieLoch.remove({session_id: session.session_id, name: name});
    }
  };

  Meteor.methods({
    setLochData: Sessie.setLochData,
    deleteLochData: Sessie.deleteLochData
  });

  
}