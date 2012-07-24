//even though this is in a /client/ directory we are going to keep it wrapped just in case.
if(Meteor.is_client) {

  Sessie.session = {};
  
  //CONFIGURATION
  // Your application can change this by hosting a sessie_config.js with these settings.
  Sessie.cookie_prefix = 'sessie';
  Sessie.cookie_seed = navigator.userAgent;
  
  Sessie.setCookie = function (c_name,value,exdays){
    var exdate=new Date();
    exdate.setDate(exdate.getDate() + exdays);
    var c_value=escape(value) + ((exdays==null) ? "" : "; expires="+exdate.toUTCString());
    document.cookie=c_name + "=" + c_value;
  };

  Sessie.getCookie = function(c_name){
    var i,x,y,ARRcookies=document.cookie.split(";");
    for (i=0;i<ARRcookies.length;i++)
    {
      x=ARRcookies[i].substr(0,ARRcookies[i].indexOf("="));
      y=ARRcookies[i].substr(ARRcookies[i].indexOf("=")+1);
      x=x.replace(/^\s+|\s+$/g,"");
      if (x==c_name)
        {
        return unescape(y);
        }
      }
  };
  
  Sessie.getCookieSessionId = function() {
    return Sessie.getCookie(Sessie.cookie_prefix + "_session_id");
  };

  Sessie.getSessionId = function() {
    var session = SessieSessions.findOne();
    if (session) {
      return session._id;
    }
  };

  Sessie.getCookieSessionKey = function() {
    return Sessie.getCookie(Sessie.cookie_prefix + "_session_key");
  };

  Sessie.getSessionKey = function() {
    var session = SessieSessions.findOne();
    if (session) {
      return session.key;
    }
  };

  Sessie.getSessionCreated = function(){
    var session = SessieSessions.findOne();
    if (session) {
      return session.created;
    }
  };

  Sessie.getSessionExpires = function() {
    var session = SessieSessions.findOne();
    if (session) {
      return session.expires;
    }
  };

  Sessie.getSessionExpiry = function() {
    var session = SessieSessions.findOne();
    if (session) {
      return session.expiry;
    }
  };

  Sessie.getSessionPermanentId = function() {
    var session = SessieSessions.findOne();
    if (session) {
      return session.permanent_id;
    }
  };

  Sessie.getSessieId = function(){
    return Sessie.getCookie("sessie_id");
  }

  Sessie.getSession = function(){
    var session = {};
    session.sessie_id = Sessie.getSessieId();
    session.session_id = Sessie.getCookieSessionId();  //must come from cookie in case preexisting, sessionr._id; //this could be a problem
    session.session_key = Sessie.getCookieSessionKey(); //must come from cookie in case preexisting, sessionr._key; //this could be a problem
    session.created = Sessie.getSessionCreated ();
    session.expires = Sessie.getSessionExpires();
    session.expiry = Sessie.getSessionExpiry();
    session.permanent_id = Sessie.getSessionPermanentId();
    return session;
  };

  Sessie.getLoch = function(){
    return SessieLoch.find();
  }

  Sessie.setLochData = function(name, value, options){
    var session = Sessie.getSession();
    var old_item = Sessie.getLochData(name);     
    if(old_item){
      if(old_item.value === value && 
        _.isEqual(old_item.options, options) || 
        old_item.options.mutable === false){
        return;
      } 
    } 
    Meteor.call('setLochData', session, name, value, options, function (error, result) { 
      if(result){
        //console.log('Sessie.setLochData result: ' + JSON.stringify(result, 0,4));
      } else {
        //console.log('Sessie.setLochData error: ' + JSON.stringify(error, 0,4));
      }
    });

  };

  function setLochData(session, name, value, options){
    // just a client stub
  };

  Sessie.addNessCollection = function(name)
  {
    var session = Sessie.getSession();
    //console.log('*** Sessie.addNessCollection *** ');
  };

  function addNessCollection(session, name){
    // just a client stub
  }

  Sessie.deleteLochData = function(name){
    var session = Sessie.getSession();
    Session.set(name, undefined);
    Meteor.call('deleteLochData', session, name, function (error, result) { 
      if(result){
        //console.log('Sessie.deleteLochData result: ' + JSON.stringify(result, 0,4));
      } else {
        //console.log('Sessie.deleteLochData error: ' + JSON.stringify(error, 0,4));
      };
    });
  }

  function deleteLochData(session, name){
    // just a client stub
  }
  
  Sessie.getLochData = function(name){
    var item = SessieLoch.findOne({name: name});
    return item;
  }

  Meteor.startup(function () {

    Meteor.subscribe('sessieSession', Sessie.getSessieId(), Sessie.getSession(), Sessie.cookie_seed);
    
    Meteor.autosubscribe(function() {

      var sessieSession = SessieSession.findOne();

      if(sessieSession){
        Sessie.setCookie("sessie_id", sessieSession._id, sessieSession.expiry);
        Session.set("sessie_id", sessieSession._id);

        Meteor.subscribe("sessieSessions", sessieSession.session_id, Sessie.getSession(), Sessie.cookie_seed);

        var clientSession = SessieSessions.findOne();
        if (clientSession) {
          if (clientSession._id && clientSession.key) {
            Sessie.setCookie(Sessie.cookie_prefix + "_session_id", clientSession._id, clientSession.expiry);
            Session.set(Sessie.cookie_prefix + "_session_id", clientSession._id);
            Sessie.setCookie(Sessie.cookie_prefix + "_session_key", clientSession.key, clientSession.expiry);
            Session.set(Sessie.cookie_prefix + "_session_key", clientSession.key);
            Meteor.subscribe("sessieLoch", clientSession._id);
          } else {
            Sessie.setCookie(Sessie.cookie_prefix + "_session_id", '', 0);
            Session.set(Sessie.cookie_prefix + "_session_id", undefined)
            Sessie.setCookie(Sessie.cookie_prefix + "_session_key", '', 0);
            Session.set(Sessie.cookie_prefix + "_session_key", undefined)
          }
        } //end if(clientSession)
      } // end if(sessieSession)
    });

    var clientLoch = SessieLoch.find();
    if(clientLoch){
      if(clientLoch){
        clientLoch.forEach(function (lochitem) {
          if(lochitem.options.meteorized){
            Session.set(lochitem.name, lochitem.value);
          }
        });
      }
    }
    
    var clientSession = SessieSessions.find();

    var handle = clientLoch.observe({
      added: function (item) {
        if(item.options.meteorized == true){
          Session.set(item.name, item.value)
        }
      },
      changed: function (item) {
        if(item.options.meteorized == true){
          Session.set(item.name, item.value);
        } else if (Session.get(item.name)){
          Session.set(item.name, undefined);
        }
      },
      removed: function (item) {
        if(item.options.meteorized == true){
          Session.set(item.name, undefined)
        } else if (Session.get(item.name)){
          Session.set(item.name, undefined);
        }
      }
    });
  });//this is the end of Meter.startup

  Meteor.methods({
    setLochData: setLochData,
    deleteLochData: deleteLochData,
    addNessCollection: addNessCollection
  });

}