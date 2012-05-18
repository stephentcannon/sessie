if(Meteor.is_client) {
// EXAMPLE IMPLEMENTATION //
  var captureCreateSession = function(error, result){
    console.log('*** captureCreateSession ***');
    if(result){
      console.log('result: ' + JSON.stringify(result,0,4));
    } else {
      console.log('error: ' + JSON.stringify(error,0,4));
      if(error.error === 500){
        console.log('SOME SERIOUS SHIT HAPPENED RROR: ' + error.reason);
      } else {
        console.log('UNKNOWN ERROR');
      }
    }
  }

  var captureValidateSession = function(error, result){
    console.log('*** captureValidateSession ***');
    if(result){
      console.log('result: ' + JSON.stringify(result,0,4));
    } else {
      console.log('error: ' + JSON.stringify(error,0,4));
      if(error.error === 401.1){
        //This means the session is not in the database
        //But they still have the cookies to prove it
        console.log('INVALID SESSION ERROR: ' + error.reason);
      } else if (error.error = 401.2) {
        //This means the session is expired
        //proly should create a new one, but we let you decide
        console.log('SESSION EXPIRED ERROR: ' + error.reason);
      } else if (error.error = 401.3) {
        //This is a serious error
        //It means cookies have been tampered with
        console.log('SECURITY VIOLATION ERROR: ' + error.reason);
      }
    }
  }
  
  $(function() {
    if(!Sessie.session.getSessionId() || !Sessie.session.getSessionKey()){
      Sessie.session.createSession(captureCreateSession);  
    } else {
      Sessie.session.validateSession(captureValidateSession);
    }
  });
}