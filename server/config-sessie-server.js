//leaving this wrapped just in case
if(Meteor.is_server) {
  // TODO CHANGE CONFIGUATION
  Sessie.expires = 3; //Set in days
  Sessie.encryption_password = "mak3th1sd1ff1cult"; //you should change this
  // set in minutes, causes new key generation, must always be less than session_timeout
  Sessie.session_key_timeout = 60; 
}
