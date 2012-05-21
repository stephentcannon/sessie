if(Meteor.is_server) {
  console.log('ran sessie configuration');


  // TODO CONFIGURATION - CHANGE THIS
  // set this in days
  // user sessions will expire based on this, unless they revisit your site
  Sessie.expires = 3;
  // this seeds the hmac 512 session key
  // if you change this and there are existing sessions those sessions will be invalid
  Sessie.encryption_password = "mak3th1sd1ff1cult"; 
  // set this in in minutes 
  // this causes new key generation
  // must always be less than session.expires
  Sessie.session_key_timeout = 10; 
}

if(Meteor.is_client) {
  console.log('ran sessie configuration');

  // CONFIGURATION
  // if you change this and there are existing sessions those sessions will be invalid
  Sessie.cookie_prefix = 'sessie';
}