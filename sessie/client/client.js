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

  Sessie.getSessionLoadSession = function() {
    var session = SessieSessions.findOne();
    if (session) {
      return session.load_session;
    }
  };

  Sessie.getSession = function(){
    var session = {};
    session.session_id = Sessie.getCookieSessionId();  //must come from cookie in case preexisting, sessionr._id; //this could be a problem
    session.session_key = Sessie.getCookieSessionKey(); //must come from cookie in case preexisting, sessionr._key; //this could be a problem
    session.created = Sessie.getSessionCreated ();
    session.expires = Sessie.getSessionExpires();
    session.expiry = Sessie.getSessionExpiry();
    session.permanent_id = Sessie.getSessionPermanentId();
    session.load_session = Sessie.getSessionLoadSession();
    return session;
  };

  Sessie.getLoch = function(){
    return SessieLoch.find();
  }

  Sessie.setLochData = function(name, value, options){
    var session = Sessie.getSession();
    //console.log('*** Sessie.setLochData ***');
    //console.log('Sessie.setLochData session.session_id: ' + session.session_id);
    //console.log('Sessie.setLochData session.session_key: ' + session.session_key);
    //console.log('Sessie.setLochData name: ' + name);
    //console.log('Sessie.setLochData value: ' + value);
    //console.log('Sessie.setLochData options.mutable: ' + options.mutable);
    //console.log('Sessie.setLochData options.visible: ' + options.visible);
    //console.log('Sessie.setLochData options.meteorized: ' + options.meteorized);
    
    var old_item = Sessie.getLochData(name);     
    if(old_item){
      if(old_item.value === value && 
        _.isEqual(old_item.options, options) || 
        old_item.options.mutable === false){
        //console.log('old item match or non-mutable');
        return;
      } else {
        // TODO remove whole else should be fine
        //console.log('old item does NOT match');
      }
    } else {
      // TODO remove whole else should be fine
      //console.log('no old_item exists');
    }

    //console.log('CALLING METEOR CALL');

    Meteor.call('setLochData', session, name, value, options, function (error, result) { 
      if(result){
        //console.log('Sessie.setLochData result: ' + JSON.stringify(result, 0,4));
      } else {
        //console.log('Sessie.setLochData error: ' + JSON.stringify(error, 0,4));
      }
    });

  };

  function setLochData(session, name, value, options){
    //console.log('*** setLochData stub ***');
    //console.log('setLochData stub session: ' + session);
    //console.log('setLochData stub session.session_id: ' + session.session_id);
    //console.log('setLochData stub session.session_key: ' + session.session_key);
    //console.log('setLochData stub name: ' + name);
    //console.log('setLochData stub value: ' + value);
    //console.log('setLochData stub options.mutable: ' + options.mutable);
    //console.log('setLochData stub options.visible: ' + options.visible);
    //console.log('setLochData stub options.meteorized: ' + options.meteorized);
  };

  Sessie.addNessCollection = function(name)
  {
    var session = Sessie.getSession();
    //console.log('*** Sessie.addNessCollection *** ');
  };

  function addNessCollection(session, name){
    //console.log('*** addNessCollection stub ***');
    //console.log('addNessCollection stub session: ' + session);
    //console.log('addNessCollection stub session.session_id: ' + session.session_id);
    //console.log('addNessCollection stub session.session_key: ' + session.session_key);
    //console.log('addNessCollection stub name: ' + name);
  }

  Sessie.deleteLochData = function(name){
    var session = Sessie.getSession();
    //console.log('*** Sessie.deleteLochData ***');
    //console.log('Sessie.deleteLochData session.session_id: ' + session.session_id);
    //console.log('Sessie.deleteLochData session.session_key: ' + session.session_key);
    Session.set(name, undefined);
    Meteor.call('deleteLochData', session, name, function (error, result) { 
      if(result){
        //console.log('Sessie.deleteLochData result: ' + JSON.stringify(result, 0,4));
        // TODO this is not optimal
        
      } else {
        //console.log('Sessie.deleteLochData error: ' + JSON.stringify(error, 0,4));
      };
    });
  }

  function deleteLochData(session, name){
    //console.log('*** deleteLochData stub ***');
    //console.log('deleteLochData stub session: ' + session);
    //console.log('deleteLochData stub session.session_id: ' + session.session_id);
    //console.log('deleteLochData stub session.session_key: ' + session.session_key);
    //console.log('deleteLochData stub name: ' + name);
  }
  
  Sessie.getLochData = function(name){
    //console.log('*** in Sessie.getLochData ***');
    //console.log('Sessie.getLochData name: ' + name);
    // TODO this should be a findOne but it errors?
    //return SessieLoch.find({name: name}); OLD
    var item = SessieLoch.findOne({name: name});
    //var item = SessieLoch.find({name: name}).fetch()[0];
    //console.log('item:' + JSON.stringify(item));
    return item;// && item.name;
  }

  Meteor.startup(function () {
    Meteor.subscribe("sessieSessions", Sessie.getSession(), Sessie.cookie_seed);
    console.log('Sessie client.js Meteor.startup');
    Meteor.autosubscribe(function() {
      console.log('Sessie client.js Meteor.autosubscribe');
      var clientSession = SessieSessions.findOne();
      if (clientSession) {
        console.log('Sessie client.js clientSession.load_session: ' + JSON.stringify(clientSession.load_session));
        if(clientSession.load_session){
          //console.log('Sessie client.js we have a .load_session');
          //console.log('clientSession._id: ' + clientSession.load_session.session_id);
          //console.log('clientSession.key: ' + clientSession.load_session.session_key);
          //console.log('clientSession.expiry: ' + clientSession.load_session.expiry);
          Sessie.setCookie(Sessie.cookie_prefix + "_session_id", clientSession.load_session.session_id, clientSession.load_session.expiry);
          Session.set(Sessie.cookie_prefix + "_session_id", clientSession.load_session.session_id);
          Sessie.setCookie(Sessie.cookie_prefix + "_session_key", clientSession.load_session.session_key, clientSession.load_session.expiry);
          Session.set(Sessie.cookie_prefix + "_session_key", clientSession.load_session.session_key);
          Meteor.subscribe("sessieLoch", clientSession.load_session);
        }else if (clientSession._id && clientSession.key && clientSession.key) {
          //console.log('setting session cookies');
          //console.log('clientSession._id: ' + clientSession._id);
          //console.log('clientSession.key: ' + clientSession.key);
          //console.log('clientSession.expires: ' + clientSession.expires);
          //console.log('clientSession.expiry: ' + clientSession.expiry);
          Sessie.setCookie(Sessie.cookie_prefix + "_session_id", clientSession._id, clientSession.expiry);
          // TODO do we really need a Meteor Session variable for this?
          Session.set(Sessie.cookie_prefix + "_session_id", clientSession._id);
          Sessie.setCookie(Sessie.cookie_prefix + "_session_key", clientSession.key, clientSession.expiry);
          // TODO do we really need a Meteor Session variable for this?
          Session.set(Sessie.cookie_prefix + "_session_key", clientSession.key);
          Meteor.subscribe("sessieLoch", Sessie.getSession());
          //Meteor.subscribe("sessieLoch", clientSession);
          /* 5.25. 5:28 PM trading out for an observe
          var clientLoch = SessieLoch.find();
          if(clientLoch){
            //console.log('Meteor autosubscribe Sessie.Loch.find if(clientLoch)');
            clientLoch.forEach(function (lochitem) {
              //console.log('lochitem: ' + JSON.stringify(lochitem));
              if(lochitem.options.meteorized){
                //console.log('lochitem.name: ' + lochitem.name);
                //console.log('lochitem.value: ' + lochitem.value);
                //console.log('options.meteorized: ' + lochitem.options.meteorized);
                Session.set(lochitem.name, lochitem.value);
                //console.log(Session);
              }
            });
          }*/
        } else {
          //console.log('deleting session cookies');
          Sessie.setCookie(Sessie.cookie_prefix + "_session_id", '', 0);
          Session.set(Sessie.cookie_prefix + "_session_id", undefined)
          Sessie.setCookie(Sessie.cookie_prefix + "_session_key", '', 0);
          Session.set(Sessie.cookie_prefix + "_session_key", undefined)
        }
      }
    });

    // TODO not sure if this belongs here
    var clientLoch = SessieLoch.find();
    if(clientLoch){
      if(clientLoch){
        //console.log('Meteor startup Sessie.Loch.find if(clientLoch)');
        clientLoch.forEach(function (lochitem) {
          //console.log('lochitem: ' + JSON.stringify(lochitem));
          if(lochitem.options.meteorized){
            //console.log('lochitem.name: ' + lochitem.name);
            //console.log('lochitem.value: ' + lochitem.value);
            //console.log('options.meteorized: ' + lochitem.options.meteorized);
            //console.log(Session);
            Session.set(lochitem.name, lochitem.value);
          }
        });
      }
    }
    var handle = clientLoch.observe({
      added: function (item) {
        //console.log('item.options.meteorized: ' + item.options.meteorized);
        //console.log('observe added called for: ' + JSON.stringify(item));
        if(item.options.meteorized == true){
          //console.log('observe added item: ' + JSON.stringify(item));
          Session.set(item.name, item.value)
        }
      },
      changed: function (item) {
        //console.log('item.options.meteorized: ' + item.options.meteorized);      
        //console.log('observe changed called for item: ' + JSON.stringify(item));
        if(item.options.meteorized == true){
          //console.log('observe changed item: ' + JSON.stringify(item));
          Session.set(item.name, item.value);
        } else if (Session.get(item.name)){
          Session.set(item.name, undefined);
        }
      },
      removed: function (item) {
        //console.log('item.options.meteorized: ' + item.options.meteorized);
        //console.log('observe removed called for item: ' + JSON.stringify(item));
        if(item.options.meteorized == true){
          //console.log('observe removed item: ' + JSON.stringify(item));
          Session.set(item.name, undefined)
        } else if (Session.get(item.name)){
          Session.set(item.name, undefined);
        }
      }
    });
});

  Meteor.methods({
    setLochData: setLochData,
    deleteLochData: deleteLochData,
    addNessCollection: addNessCollection
  });

}