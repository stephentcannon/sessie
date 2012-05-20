if(Meteor.is_client) {
  
  Sessie = {};
  
  Sessie.session = {};
  
  //CONFIGURATION
  Sessie.cookie_prefix = 'sessie';
  
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

  Sessie.setLochData = function(name, value){
    this.unblock
    session = Sessie.getSession();
    console.log('session.session_id: ' + session.session_id);
    console.log('ession.session_key: ' + session.session_key);
    Meteor.call('setLochData', session, name, value, function (error, result) { 
      console.log('error: ' + JSON.stringify(error, 0,4));
      console.log('result: ' + JSON.stringify(result, 0,4));
    });
  };

  function setLochData(session, name, value){
    console.log('setLochData stub');
    console.log('setLochData stub session: ' + session);
    console.log('setLochData stub session.session_id: ' + session.session_id);
    console.log('setLochData stub session.session_key: ' + session.session_key);
    console.log('setLochData stub name: ' + name);
    console.log('setLochData stub value: ' + value);
  };

  Sessie.Sessions = new Meteor.Collection('sessieSessions');
  Meteor.subscribe("sessieSessions", Sessie.getSession());

  Sessie.Loch = new Meteor.Collection('sessieLoch');

  Meteor.autosubscribe(function() {
    var clientSession = Sessie.Sessions.findOne();
    if (clientSession) {
      if (clientSession._id && clientSession.key && clientSession.key) {
        console.log('setting session cookies');
        console.log('clientSession._id: ' + clientSession._id);
        console.log('clientSession.key: ' + clientSession.key);
        console.log('clientSession.expires: ' + clientSession.expires);
        console.log('clientSession.expiry: ' + clientSession.expiry);
        Sessie.setCookie(Sessie.cookie_prefix + "_session_id", clientSession._id, clientSession.expiry);
        Session.set(Sessie.cookie_prefix + "_session_id", clientSession._id);
        Sessie.setCookie(Sessie.cookie_prefix + "_session_key", clientSession.key, clientSession.expiry);
        Session.set(Sessie.cookie_prefix + "_session_key", clientSession.key);
        Meteor.subscribe("sessieLoch", Session.get(Sessie.cookie_prefix + "_session_id"));
      } else {
        console.log('deleting session cookies');
        Sessie.setCookie(Sessie.cookie_prefix + "_session_id", '', 0);
        Sessie.setCookie(Sessie.cookie_prefix + "_session_key", '', 0);
      }
    }
  });

}