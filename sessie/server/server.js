//even though this is in a /server/ directory we are going to keep it wrapped just in case.
if(Meteor.is_server) {
  
  Meteor.startup(function () {
  _.each(['sessieSession', 'sessieSessions', 'sessieLoch'], function(collection) {
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
  Sessie.permanent_expires = 365;

  Meteor.publish('sessieSession', function(sessie_id, session, seed){
    console.log('***Meteor.publish sessieSession ***');
    console.log('***Meteor.publish sessieSession id: ' + sessie_id);
    var sessieId = Sessie.validateOrCreateSessie(sessie_id, session, seed);
    return SessieSession.find({_id: sessieId }, { limit: 1 });
  });

  // Meteor.publish('sessieSessions', function(sessieSession, session, seed) {
  //   console.log('*** Meteor.publish sessieSessions ***');
  //   console.log('*** Meteor.publish sessieSessions sessie_session: ' + JSON.stringify(sessie_session._id, 0, 4));
  //   console.log('*** Meteor.publish sessieSessions session: ' + JSON.stringify(session, 0, 4));
  //   console.log('*** Meteor.publish sessieSessions  seed: ' + seed);
  //   var sessionId = Sessie.validateOrCreateSession(sessieSession, session, seed);
  //   return SessieSessions.find({ _id: sessionId}, { limit: 1, fields: { key_id: false, seed: false } });
  // });

  Meteor.publish('sessieSessions', function(session_id, session, seed){
    console.log('*** Meteor.publish sessieSessions ***');
    console.log('*** Meteor.publish sessieSessions session_id: ' + session_id);
    console.log('*** Meteor.publish sessieSessions session: ' + JSON.stringify(session));
    console.log('*** Meteor.publish sessieSessions seed: ' + seed);
    //TODO I could still validate it here and return a boolean maybe?
    return SessieSessions.find({_id: session_id}, { limit: 1, fields: { key_id: false, seed: false } });
  });

  Meteor.publish('sessieLoch', function(session_id){
    console.log('*** Meteor.publish sessieLoch ***');
    return SessieLoch.find({session_id: session_id, 'options.visible': true });
  });
  
  Sessie.delete = function(id) {
    // TODO pass session_id to Monster to clean up colleciton items IF turned on.
    // TODO here not permanent
    console.log('*** Sessie.delete sessieLoch ***');
    SessieLoch.remove({session_id: id});
    SessieSessions.remove({_id: id});
    return true;
  };

  Sessie.cleanUp = function() {
    console.log('*** Sessie.cleanUp sessieLoch ***');
    now = new Date();
    // TODO get collection of expired sessions to handle the two TODOs below.
    // TODO delete expired session Loch data through Monster
    // TODO pass session_id to Monster to clean up colleciton items IF turned on.
    // TODO where NOT permanent
    SessieSession.remove({expires: {$lt: now}});
    SessieSessions.remove({expires: {$lt: now}})
  };

  // this returns the SessieSession tracker or creates on if it doesn't exist
  Sessie.validateOrCreateSessie = function(id, session, seed){
    // TODO this could be improved and be more elegant
    console.log('*** validateOrCreateSessie***');
    var sessieId;
    var sessie;
    if( sessie = SessieSession.findOne({_id: id}) ) {
      if(session.session_id){
        console.log('*** validateOrCreateSessie session.session_id found: ' + JSON.stringify(session));
        if(sessie.session_id == session.session_id){
          console.log('*** validateOrCreateSessie sessie.session_id + session.session_id MATCH'); 
          if(!this.validateSession(session, seed)){
            // Condition = invalid sessoin, create and assign to sessie
            console.log('*** validateOrCreateSessie invalid session creating a new one'); 
            sessionId = this.createSession(seed);
            console.log('*** validateOrCreateSessie new session: ' + sessionId);
            console.log('*** validateOrCreateSessie calling setSessieSessionId: ' + sessionId);
            this.setSessieSessionId(id, sessionId);
            sessieId = sessie._id;
          } else {
            // Condition = sessie, session_id and session_key validated successfully, good condition
            console.log('*** validateOrCreateSessie this.validateSession(session, seed) returned true'); 
            sessieId = sessie._id;
          }
        } else {
          // Condition = invalid session_id, changed server side, load new session
          console.log('*** validateOrCreateSessie sessie.session_id + session.session_id DO NOT MATCH'); 
          sessieId = sessie._id;
        }
      } else {
        // Condition = situation where sessie_id may have been compromised, create new Session to prevent session hijacking
        console.log('*** validateOrCreateSessie session.session_id is undefined? ' + session.session_id); 
        sessionId = this.createSession(seed);
        this.setSessieSessionId(id, sessionId);
        sessieId = sessie._id;
      } 
    } else {
      // Condition = sessie record does not exist, create sessie and session
      console.log('*** validateOrCreateSessie record not found calling Sessie.createSessie creates SessieSessoin and SessieSessions record for now');
      sessieId = this.createSessie(seed);
    }
    return sessieId;
  };

  // this creates a Sessie session tracker
  Sessie.createSessie = function(seed){
    console.log('*** Sessie.createSessie ***');
    var expires = new Date();
    expires.setDate(expires.getDate()+Sessie.expires);
    //create a session for now because the client subscribes to it this way
    sessionId = this.createSession(seed);
    id = SessieSession.insert({ 
      created: new Date(),
      updated: new Date(), 
      expires: expires,
      expiry: Sessie.expires,
      session_id: sessionId
    });
    if(id){
      return id;      
    }else{
      //throw new Meteor.Error(600, 'Internal Server Error. Session creation failed.');
      return null;
    }  
  };

  //TODO this is ONLY needed SERVER SIDE
  Sessie.setSessieSessionId = function(sessie_id, session_id){
    console.log('*** Sessie.setSessieSessionId *** ');
    console.log('*** Sessie.setSessieSessionId sessie_id: ' + sessie_id);
    console.log('*** Sessie.setSessieSessionId session_id: ' + session_id);
    var expires = new Date();
    expires.setDate(expires.getDate()+Sessie.expires);
    SessieSession.update({_id: sessie_id}, 
      {$set: {
       expires: expires, 
       expiry: Sessie.expires,
       updated: new Date(),
       session_id: session_id
     }},function(error){});
  }

  // TODO this can be removed, search first, not called from anywhere
  Sessie.validateOrCreateSession = function(sessieSession, session, seed) {
    //sessieSession is the collection record subscribe to on the client
    //session is the cookie session object
    //seed is the key seed
    console.log('*** validateOrCreateSession ***');
    console.log('*** validateOrCreateSession sessieSession._id: ' + sessieSession._id);
    console.log('*** validateOrCreateSession sessieSession.session_id: ' + sessieSession.session_id);
    console.log('*** validateOrCreateSession session.sessie_id: ' + session.sessie_id);
    console.log('*** validateOrCreateSession session.session_key: ' + session.session_key);
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

  Sessie.generateKey = function(seed){
    console.log('*** generateKey ***');
    var key = {};
    key.id = Meteor.uuid();
    var hash = CryptoJS.HmacSHA512(key.id + seed, Sessie.encryption_password); 
    key.key = hash.toString(CryptoJS.enc.Hex); 
    //console.log('generateKey key.id: ' + key.id);
    //console.log('generateKey key.key: ' + key.key);
    return key;
  };

  Sessie.validateKey = function(id, key2){
    //console.log('*** validateKey ***');
    //console.log('id: ' + id);
    //console.log('key2: ' + key2);
    var hash = CryptoJS.HmacSHA512(id, Sessie.encryption_password); 
    var test_key = (hash.toString(CryptoJS.enc.Hex));
    //console.log('test_key: ' + test_key);
    if(test_key === key2){
      //console.log('returning true');
      return true;
    } else {
      //console.log('returning false');
      return false;
    }
  };

  
  Sessie.updateSessionKey = function(session, key){
    console.log('*** updateSessionKey ***');
    var expires = new Date();
    var expiry;
    if(session.permanent_id !== null && session.permanent_id !== undefined && session.permanent_id !== '' ){
      expires.setDate(expires.getDate()+Sessie.permanent_expires);
      expiry = Sessie.permanent_expires;
    } else {
      expires.setDate(expires.getDate()+Sessie.expires);
      expiry = Sessie.expires;
    }
    SessieSessions.update({_id: session.session_id}, 
      {$set: {
      expires: expires, 
      expiry: expiry,
      updated: new Date(),
      key_id: key.id,
      key: key.key
    }},function(error){});
  };

  Sessie.updateSessionExpiry = function(session){
    console.log('*** updateSessionExpiry ***');
    //console.log('session: ' + JSON.stringify(session));
    var expires = new Date();
    var expiry;
    if(session.permanent_id !== null && session.permanent_id !== undefined && session.permanent_id !== '' ){
      expires.setDate(expires.getDate()+Sessie.permanent_expires);
      expiry = Sessie.permanent_expires;
    } else {
      expires.setDate(expires.getDate()+Sessie.expires);
      expiry = Sessie.expires;
    }
    //console.log('expires: ' + expires);
    //console.log('expiry: ' + expiry);
    SessieSession.update({_id: session.sessie_id},
      {$set: {
        expires: expires,
        expiry: expiry,
      }}, function(error){});
    SessieSessions.update({_id: session.session_id}, 
      {$set: {
      expires: expires, 
      expiry: expiry,
      updated: new Date()
    }}, function(error){});
  };

  Sessie.validateSession = function(session) {
    console.log('*** validateSession ***');
    //console.log('validateSession session: ' + JSON.stringify(session));
    var serverSession;
    if(serverSession = SessieSessions.findOne({
      _id: session.session_id
      })) 
    {
      var now = new Date();
      var session_key_timeout = new Date();
      //on first page load the session object many times only has the id and key
      //so we have to do a light updating bootsrap of it with the serverSession object
      //because it gets passed onto two other functions
      //we believe that permanent id is the only thing to update
      console.log('validateSession serverSession.permanent_id: ' + serverSession.permanent_id);
      session.permanent_id = serverSession.permanent_id;
      //console.log('now: ' + now);
      //var session_key_timeout = new Date(now - (Sessie.session_key_timeout * 60000));
      session_key_timeout.setMinutes(now.getMinutes() - Sessie.session_key_timeout);
      //console.log('session_key_timeout: ' + session_key_timeout);
      //console.log('serverSession.expires: ' + serverSession.expires);
      //console.log('serverSession.updated: ' + serverSession.updated);
      if(serverSession.expires < now && !session.permanent_id) {
        //session expired
        Sessie.cleanUp();
        return false;
      } else {
        if(this.validateKey(serverSession.key_id + serverSession.seed, session.session_key)){
          if(serverSession.updated <  session_key_timeout){
            //console.log('key timed out');
            var key = this.generateKey();
            this.updateSessionKey(session, key);
          } else {
            //console.log('key not timed out');
            var key = {};
            this.updateSessionExpiry(session);
          }
          return true;
        } else {
          Sessie.delete(session.session_id);
          //TODO invalid session credentials on client, maybe tampered with TEST ME
          //console.log('invalid session key validation failed');
          return false;
        }
      }
    } else {
      //TODO session not found in database
      //console.log('session not found in database');
      return false;
    }
  };


  Sessie.setPermanent = function(session, permanent_id){
   //console.log('*** Sessie.setPermanent ***');
    var expires = new Date();
    expires.setDate(expires.getDate()+Sessie.permanent_expires);
     SessieSessions.update({_id: session.session_id}, 
      {$set: {
      expires: expires, 
      expiry: Sessie.permanent_expires,
      updated: new Date(),
      permanent_id: permanent_id
    }},function(error){
      if(error){
        //console.log('Session.setPermanent error: ' + error)
      }
    });
  };

  Sessie.unsetPermanent = function(session){
    //console.log('*** Sessie.unsetPermanent ***');
    var expires = new Date();
    expires.setDate(expires.getDate()+Sessie.expires);
    var permanent_id = null;
    SessieSessions.update({_id: session.session_id}, 
      {$set: {
      expires: expires, 
      expiry: Sessie.expires,
      updated: new Date(),
      permanent_id: permanent_id
    }},function(error){
      if(error){
        //console.log('Session.setPermanent error: ' + error)
      }
    });
  };

  // this can be called by other server code to set the sesion that should be loaded
  // by a temporary session
  Sessie.loadPermanentSession = function(permanent_id, session){
    console.log('*** Sessie.loadPermanentSession ***');
    var serverSessie;
    var serverSession;
    //sanity check if the incomine permanent_id already matches the session.permanent_id do nothing
    if(permanent_id !== session.permanent_id){
      if(serverSessie = SessieSession.findOne({session_id: session.session_id}) ){
        console.log('*** Sessie.loadPermanentSession serverSessie: ' + JSON.stringify(serverSessie));
        if(serverSession = SessieSessions.findOne({permanent_id: permanent_id}) ){
          // TODO should I check whether the serverSessie.session_id matches the serverSession._id ?
          // ABOVE that should have already been caught by checking the submitted permanent_id and session.permanent_id
          console.log('*** Sessie.loadPermanentSession serverSession: ' + JSON.stringify(serverSession));
          console.log('*** Sessie.loadPermanentSession permanent_id: ' + permanent_id);
          console.log('*** Sessie.loadPermanentSession session.permanent_id: ' + session.permanent_id);
          console.log('*** Sessie.loadPermanentSession serverSession.permanent_id: ' + serverSession.permanent_id);
          //this is a sanity check, no need to do this if the permanent_id already matches the session
            console.log('*** Sessie.loadPermanentSession setting load_session');
            //set the new session
            this.setSessieSessionId(session.sessie_id, serverSession._id);
            var load_session = {};
            load_session.session_id = serverSession._id;
            load_session.session_key = serverSession.key;
            load_session.created = serverSession.created;
            load_session.expires = serverSession.expires;
            load_session.expiry = serverSession.expiry;
            load_session.permanent_id = serverSession.permanent_id;
            return load_session;
        }
      } 
    } else {
      //return session if the permanent_id and session sent into method matches
      //mistake of caller
      return session;
    }
  };

  Sessie.getLochData = function(session, name){
    console.log('*** Sessie.getLochData ***');
    if(Sessie.validateSession(session)){
      return SessieLoch.findOne({session_id: session.session_id, name: name});
    }
  };

  // PRIVATE DO NOT EVER 
  // USE SERVER SIDE
  Sessie.setLochSessionData = function(session, name, value, options){
    console.log('*** Sessie.setSessionData ***');
    //console.log('*** setSessionData options: ' + JSON.stringify(options));
    //console.log('*** setSessionData session: ' + JSON.stringify(session));
    //console.log('*** setSessionData name: ' + name);
    //console.log('*** setSessionData value: ' + value);
    if(!options){
      //set default
      var options = {};
      options.mutable = true;
      options.visible = true;
      options.meteorized = true;
    } else {
      options.mutable = (options.mutable !== true)? false:true;
      options.visible = (options.visible !== true)? false:true;
      options.meteorized = (options.meteorized !== true)? false:true;
    }
    if(name !== null && name !== undefined && name !== '' && 
      value !== null && value !== undefined && value !== ''){
      if(Sessie.getLochData(session, name)){
        console.log('*** setSessionData updating existing data');
        SessieLoch.update({session_id: session.session_id, name: name}, 
        {$set: {
        updated: new Date(),
        value: value,
        options: options
        }}, function(error){
          //console.log('*** setSessionData error: ' + JSON.stringify(error, 0,4));
          if(error){
            return false;
          } else {
            return true;
          }
        });
      } else {
        //console.log('*** setSessionData inserting new data');
        SessieLoch.insert({ 
        created: new Date(),
        updated: new Date(), 
        session_id: session.session_id,
        name: name,
        value: value,
        options: options
        },function(error, result){
          //console.log('*** setSessionData error: ' + JSON.stringify(error, 0,4));
          //console.log('*** setSessionData result: ' + JSON.stringify(result, 0,4));
          if(result){
            return true;
          } else {
            return false;
          }
        });
      }
    } else {
      //console.log('*** setSessionData DOH no name && value');
    }
  };

  // PRIVATE DO NOT EVER EXPOSE
  // USE SERVER SIDE
  Sessie.deleteLochSessionData = function(session, name){
    SessieLoch.remove({session_id: session.session_id, name: name});
  };

  // BELOW THIS LINE ARE ALL EXPOSED VIA PUBLIC METEOR METHODS
  // TREAD WITH CAUTION
  // EXPOSED WITH METEOR.METHOD
  Sessie.setLochData = function(session, name, value, options){
    this.unblock();
    console.log('*** Meteor Method setLochData ***');
    console.log('*** Meteor Method setLochData calling Sessie.validateSession ***');
    if(Sessie.validateSession(session)){
      //console.log('*** setLochData session.session_id: ' + session.session_id);
      //console.log('*** setLochData session.session_key: ' + session.session_key);
      //console.log('*** setLochData name: ' + name);
      //console.log('*** setLochData value: ' + value);
      //console.log('*** setLochData options: ' + JSON.stringify(options));
      // TODO should probably have callback support for error, result like Meteor does
      var old_item  = Sessie.getLochData(session, name);
      if(old_item ){
        if(old_item.value === value && 
        _.isEqual(old_item.options, options) || 
        old_item.options.mutable === false){
          //console.log('value and option duplicate or non-mutable just return');
          return;
        }else{
          Sessie.setLochSessionData(session, name, value, options);
        }

      } else {
        Sessie.setLochSessionData(session, name, value, options);
      }
    }
  };
  
  //EXPOSED WITH METEOR.METHOD
  Sessie.deleteLochData = function(session, name){
    this.unblock();
    //console.log('*** deleteLochData ***');
    var lochitem = Sessie.getLochData(session, name);
   // console.log('deleteLochData name: ' + name);
    //console.log('deleteLochData mutable: ' + lochitem.options.mutable);
    if(lochitem.options.mutable === true){
      if(Sessie.validateSession(session)){
        Sessie.deleteLochSessionData(session, name);
      }
    }
  };

  //EXPOSED WITH METEOR.METHOD
  Sessie.addNessCollection = function(session, name){
    this.unblock();
    //console.log('*** registerNessCollection ***');
    if(Sessie.validateSession(session)){

    }
    return 'this be bullshit';
  };

  Meteor.methods({
    setLochData: Sessie.setLochData,
    deleteLochData: Sessie.deleteLochData,
    addNessCollection: Sessie.addNessCollection
  });

  
}