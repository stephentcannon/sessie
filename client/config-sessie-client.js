//leaving this wrapped just in case
if(Meteor.is_client) {
  
  // TODO CHANGE Sessie.cookie_prefix
  // this is what preceeds your session cookie names of session_id and sesion_key
  // i.e as is results in sessie_session_id and sessie_session_key
  // if you change this and there are existing sessions those sessions will be invalid
  Sessie.cookie_prefix = 'sessie';
  // TODO CHANGE Sessie.cookie_seed
  // this helps seed a unique secret session key that is encrypted by the server
  // you can make this static,  ora browser variable, or grab their ip remotely 
  // or write a routing to generate one.
  Sessie.cookie_seed = navigator.userAgent;
}