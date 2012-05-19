if(Meteor.is_client) {
  Sessie = {}
  Sessie.session = {};
  //CONFIGURATION
  Sessie.cookie_prefix = 'sessie';
  Sessie.setCookie = function (c_name,value,exdays)
  {
    var exdate=new Date();
    exdate.setDate(exdate.getDate() + exdays);
    var c_value=escape(value) + ((exdays==null) ? "" : "; expires="+exdate.toUTCString());
    document.cookie=c_name + "=" + c_value;
  } 
  Sessie.getCookie = function(c_name)
  {
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
  }
  
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
  }

  Sessie.Sessions = new Meteor.Collection('sessieSessions');
  Meteor.subscribe("sessieSessions", Sessie.getSession());

  Meteor.autosubscribe(function() {
    var clientSession = Sessie.Sessions.findOne();
    if (clientSession) {
      if (clientSession._id && clientSession.key && clientSession.key) {
        //console.log('setting session cookies');
        //console.log('clientSession._id: ' + clientSession._id);
        //console.log('clientSession.key: ' + clientSession.key);
        //console.log('clientSession.expires: ' + clientSession.expires);
        //console.log('clientSession.expiry: ' + clientSession.expiry);
        Sessie.setCookie(Sessie.cookie_prefix + "_session_id", clientSession._id, clientSession.expiry);
        Sessie.setCookie(Sessie.cookie_prefix + "_session_key", clientSession.key, clientSession.expiry);
      } else {
        //console.log('deleting session cookies');
        Sessie.setCookie(Sessie.cookie_prefix + "_session_id", '', 0);
        Sessie.setCookie(Sessie.cookie_prefix + "_session_key", '', 0);
      }
    }
  });

}