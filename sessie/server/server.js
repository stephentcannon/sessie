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
    var sessieId = Sessie.validateOrCreateSessie(sessie_id, session, seed);
    return SessieSession.find({_id: sessieId }, { limit: 1 });
  });


  Meteor.publish('sessieSessions', function(session_id, session, seed){
    return SessieSessions.find({_id: session_id}, { limit: 1, fields: { key_id: false, seed: false } });
  });

  Meteor.publish('sessieLoch', function(session_id){
    return SessieLoch.find({session_id: session_id, 'options.visible': true });
  });
    
  Sessie.monster = function(session){
    if(session){
      if(!session.permanent_id) {
        SessieLoch.remove({session_id: session.session_id});
        SessieSessions.remove({_id: session.session_id});
      }
    } else {
      now = new Date();   
      SessieSession.remove({expires: {$lt: now}});
      var serverSessions = SessieSessions.find({expires: {$lt: now}, permanent_id: null});
      serverSessions.forEach(function (asession) {
         SessieLoch.remove({session_id: asession.session_id});
      });
      SessieSessions.remove({expires: {$lt: now}, permanent_id: null});
    }
  }  

  Sessie.validateOrCreateSessie = function(id, session, seed){
    var sessieId;
    var sessie;
    if( sessie = SessieSession.findOne({_id: id}) ) {
      if(session.session_id){
        if(sessie.session_id == session.session_id){
          if(!this.validateSession(session, seed)){
            sessionId = this.createSession(seed);
            this.setSessieSessionId(id, sessionId);
            sessieId = sessie._id;
          } else {
            sessieId = sessie._id;
          }
        } else {
          sessieId = sessie._id;
        }
      } else {
        sessionId = this.createSession(seed);
        this.setSessieSessionId(id, sessionId);
        sessieId = sessie._id;
      } 
    } else {
      sessieId = this.createSessie(seed);
    }
    return sessieId;
  };

  Sessie.createSessie = function(seed){
    var expires = new Date();
    expires.setDate(expires.getDate()+Sessie.expires);
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
      return null;
    }  
  };

  Sessie.setSessieSessionId = function(sessie_id, session_id){
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

  Sessie.validateOrCreateSession = function(sessieSession, session, seed) {
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
      key: key.key,
      permanent_id: null
    });
    if(id){
      return id;      
    }else{
      return null;
    }  
  };

  Sessie.generateKey = function(seed){
    var key = {};
    key.id = Meteor.uuid();
    var hash = CryptoJS.HmacSHA512(key.id + seed, Sessie.encryption_password); 
    key.key = hash.toString(CryptoJS.enc.Hex); 
    return key;
  };

  Sessie.validateKey = function(id, key2){
    var hash = CryptoJS.HmacSHA512(id, Sessie.encryption_password); 
    var test_key = (hash.toString(CryptoJS.enc.Hex));
    if(test_key === key2){
      return true;
    } else {
      return false;
    }
  };

  Sessie.updateSessionKey = function(session, key){
    var expires = new Date();
    var expiry;
    if(!session.permanent_id) {
      expires.setDate(expires.getDate()+Sessie.expires);
      expiry = Sessie.expires;
    } else {
      expires.setDate(expires.getDate()+Sessie.permanent_expires);
      expiry = Sessie.permanent_expires;
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
    var expires = new Date();
    var expiry;
    if(!session.permanent_id){
      expires.setDate(expires.getDate()+Sessie.expires);
      expiry = Sessie.expires;
    } else {
      expires.setDate(expires.getDate()+Sessie.permanent_expires);
      expiry = Sessie.permanent_expires;
    }
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
    var serverSession;
    if(serverSession = SessieSessions.findOne({
      _id: session.session_id
      })) 
    {
      var now = new Date();
      var session_key_timeout = new Date();
      session.permanent_id = serverSession.permanent_id;
      session_key_timeout.setMinutes(now.getMinutes() - Sessie.session_key_timeout);
      if(serverSession.expires < now) {
        Sessie.monster();
        return false;
      } else {
        if(this.validateKey(serverSession.key_id + serverSession.seed, session.session_key)){
          if(serverSession.updated <  session_key_timeout){
            var key = this.generateKey();
            this.updateSessionKey(session, key);
          } else {
            var key = {};
            this.updateSessionExpiry(session);
          }
          return true;
        } else {
          Sessie.monster(session);
          return false;
        }
      }
    } else {
      return false;
    }
  };


  Sessie.setPermanent = function(session, permanent_id){
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
        return false;
      } else {
        return true;
      }
    });
  };

  Sessie.unsetPermanent = function(session){
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
        return false;
      } else {
        return true;
      }
    });
  };
 
  Sessie.unloadPermanentSession = function(session){
    var serverSessie;
    var serverSession;
    if(serverSessie = SessieSession.findOne({session_id: session.session_id}) ){
      if(serverSession = SessieSessions.findOne({permanent_id: session.permanent_id}) ){
        var sessionId = this.createSession(serverSession.seed);
        this.setSessieSessionId(session.sessie_id, sessionId);
      }
    }
  }

  Sessie.loadPermanentSession = function(permanent_id, session){
    var serverSessie;
    var serverSession;
    if(permanent_id !== session.permanent_id){
      if(serverSessie = SessieSession.findOne({session_id: session.session_id}) ){
        if(serverSession = SessieSessions.findOne({permanent_id: permanent_id}) ){
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
      return session;
    }
  };

  Sessie.getLochData = function(session, name){
    if(Sessie.validateSession(session)){
      return SessieLoch.findOne({session_id: session.session_id, name: name});
    }
  };

  Sessie.setLochSessionData = function(session, name, value, options){
    if(!options){
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
        SessieLoch.update({session_id: session.session_id, name: name}, 
        {$set: {
        updated: new Date(),
        value: value,
        options: options
        }}, function(error){
          if(error){
            return false;
          } else {
            return true;
          }
        });
      } else {
        SessieLoch.insert({ 
        created: new Date(),
        updated: new Date(), 
        session_id: session.session_id,
        name: name,
        value: value,
        options: options
        },function(error, result){
          if(result){
            return true;
          } else {
            return false;
          }
        });
      }
    } else {
    }
  };

  Sessie.deleteLochSessionData = function(session, name){
    SessieLoch.remove({session_id: session.session_id, name: name});
  };

  // BELOW THIS LINE ARE ALL EXPOSED VIA PUBLIC METEOR METHODS
  // TREAD WITH CAUTION
  // EXPOSED WITH METEOR.METHOD
  Sessie.setLochData = function(session, name, value, options){
    this.unblock();
    if(Sessie.validateSession(session)){
      var old_item  = Sessie.getLochData(session, name);
      if(old_item ){
        if(old_item.value === value && 
        _.isEqual(old_item.options, options) || 
        old_item.options.mutable === false){
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
    var lochitem = Sessie.getLochData(session, name);
    if(lochitem.options.mutable === true){
      if(Sessie.validateSession(session)){
        Sessie.deleteLochSessionData(session, name);
      }
    }
  };

  Meteor.methods({
    setLochData: Sessie.setLochData,
    deleteLochData: Sessie.deleteLochData
  });
  
}