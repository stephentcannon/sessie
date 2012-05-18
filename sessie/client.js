if(Meteor.is_client) {
  Sessie = {}
  Sessie.session = {};

  function Sessie_session_start() {
  }
  function Sessie_session_validate(){
  }
  Sessie.session.setCookie = function (c_name,value,exdays)
  {
    var exdate=new Date();
    exdate.setDate(exdate.getDate() + exdays);
    var c_value=escape(value) + ((exdays==null) ? "" : "; expires="+exdate.toUTCString());
    document.cookie=c_name + "=" + c_value;
  } 
  Sessie.session.getCookie = function(c_name)
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
  Sessie.session.createSession = function(callback){
    Meteor.call('Sessie_session_start', function(error, result){
        var retval;
        if(result){
          Sessie.session.setCookie("sessie_session_id", result.session_id, result.expires);
          Sessie.session.setCookie("sessie_session_key", result.session_key, result.expires);
          retval = true;
        } else {
          retval = false;
        }
        callback(error, result);
        return retval;
    });
  }
  Sessie.session.validateSession = function(callback){
    Meteor.call('Sessie_session_validate',Sessie.session.getSession(), function(error, result){
      var retval;
      if(result){
        retval = true;
      } else {
        retval = false;
      }
      callback(error, result);
      return retval;
    });
  }
  Sessie.session.getSessionId = function() {
    return Sessie.session.getCookie("sessie_session_id");
  };
  Sessie.session.getSessionKey = function() {
    return Sessie.session.getCookie("sessie_session_key");
  };
  Sessie.session.getSession = function(){
    var session = {};
    session.session_id = Sessie.session.getSessionId();
    session.session_key = Sessie.session.getSessionKey();
    return session;
  }
}