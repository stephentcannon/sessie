//leaving this wrapped just in case
if(Meteor.is_server) {
  
  // TODO CHANGE Sessie.expires
  // set this in days
  // user sessions will expire based on this, unless they revisit your site
  Sessie.expires = 3;

  // TODO CHANGE Sessie.encryption_password
  // this seeds the hmac 512 session key
  // if you change this and there are existing sessions those sessions will be invalid
  Sessie.encryption_password = "mak3th1sd1ff1cult"; 
  
  // TODO CHANGE Sessie.sesion_key_timeout
  // you should change this to at least an hour if not more.
  // set this in in minutes 
  // this causes new key generation
  // must always be less than session.expires
  Sessie.session_key_timeout = 10; 
}

