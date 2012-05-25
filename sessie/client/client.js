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
  
  Sessie.getSessionId = function() {
    return Sessie.getCookie("sessie_session_id");
  };

  Sessie.getSessionKey = function() {
    return Sessie.getCookie("sessie_session_key");
  };

  Sessie.getSession = function(){
    var session = {};
    session.session_id = Sessie.getSessionId();
    session.session_key = Sessie.getSessionKey();
    return session;
  };

  Sessie.getLoch = function(){
    return SessieLoch.find();
  }

  Sessie.setLochData = function(name, value, options){
    this.unblock
    var session = Sessie.getSession();
    console.log('*** Sessie.setLochData ***');
    console.log('Sessie.setLochData session.session_id: ' + session.session_id);
    console.log('Sessie.setLochData session.session_key: ' + session.session_key);
    console.log('setLochData stub options.mutable: ' + options.mutable);
    console.log('setLochData stub options.visible: ' + options.visible);
    console.log('setLochData stub options.meteorized: ' + options.meteorized);
    Meteor.call('setLochData', session, name, value, options, function (error, result) { 
      if(result){
        console.log('Sessie.setLochData result: ' + JSON.stringify(result, 0,4));
      } else {
        console.log('Sessie.setLochData error: ' + JSON.stringify(error, 0,4));
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

  Sessie.registerNessCollection = function(name)
  {
    this.unblock;
    var session = Sessie.getSession();
    console.log('*** Sessie.registerNessCollection *** ');


  };

  function registerNessCollection(session, name){
    console.log('*** registerNessCollection stub ***');
    console.log('deleteLochData stub session: ' + session);
    console.log('deleteLochData stub session.session_id: ' + session.session_id);
    console.log('deleteLochData stub session.session_key: ' + session.session_key);
    console.log('deleteLochData stub name: ' + name);
  }

  Sessie.deleteLochData = function(name){
    this.unblock;
    var session = Sessie.getSession();
    console.log('*** Sessie.deleteLochData ***');
    //console.log('Sessie.deleteLochData session.session_id: ' + session.session_id);
    //console.log('Sessie.deleteLochData session.session_key: ' + session.session_key);
    Session.set(name, undefined);
    Meteor.call('deleteLochData', session, name, function (error, result) { 
      if(result){
        console.log('Sessie.setLochData result: ' + JSON.stringify(result, 0,4));
        // TODO this is not optimal
        
      } else {
        console.log('Sessie.setLochData error: ' + JSON.stringify(error, 0,4));
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
    return SessieLoch.find({session_id: Sessie.getSessionId(), name: name});
  }

  Meteor.startup(function () {
    Meteor.subscribe("sessieSessions", Sessie.getSession(), Sessie.cookie_seed);

    Meteor.autosubscribe(function() {
      var clientSession = SessieSessions.findOne();
      if (clientSession) {
        if (clientSession._id && clientSession.key && clientSession.key) {
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
          Meteor.subscribe("sessieLoch", clientSession);
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
          }
        } else {
          //console.log('deleting session cookies');
          Sessie.setCookie(Sessie.cookie_prefix + "_session_id", '', 0);
          Session.set(Sessie.cookie_prefix + "_session_id", undefined)
          Sessie.setCookie(Sessie.cookie_prefix + "_session_key", '', 0);
          Session.set(Sessie.cookie_prefix + "_session_key", undefined)
        }
      }
    });
});

  Meteor.methods({
    setLochData: setLochData,
    deleteLochData: deleteLochData,
    registerNessCollection: registerNessCollection
  });

}