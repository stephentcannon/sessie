//leaving this wrapped just in case
if(Meteor.is_server) {
  // this drives the User registration, login and permanents demonstration
  //protect users a bit
  Meteor.startup(function () {
  _.each(['Users'], function(collection) {
    _.each(['insert', 'update', 'remove'], function(method) {
      Meteor.default_server.method_handlers['/' + collection + '/' + method] = function() {};
      });
    });
  });

  //Users publish for demo of user registration and session permanency
  Meteor.publish('Users', function(username){
    //console.log('*** Meteor.publish Users ***');
    //console.log('user: ' + username);
    if(username){
      return Users.find( { username: username });
    } else {
      return
    }  
  });

  registerUser = function(params, session){
    //this.unblock();
    console.log('*** registerUser ***');
    console.log('*** example-server.js registerUser ***');
    validateParams(params);
    console.log('example-server.js registerUser params: ' + JSON.stringify(params));
    console.log('session: ' + JSON.stringify(session));
    if( Users.find({username: params.username}).count() === 0 ){
      console.log('creating user');
      //we are going to insert the Sessie session_id in with our Users records just for the sake of it
      //you might want to consider making sure the session isn't already registered to another user
      id = Users.insert({ 
        created: new Date(),
        username: params.username,
        password: params.password,
        session_id: session.session_id
      });
      if(id){
        console.log('registerUser result: ' + id);
        Sessie.setPermanent(session, params.username);
        return "Successful registration";
      } else{
        throw new Meteor.Error(500, 'Internal Server Error.');
      }
    } else {
      throw new Meteor.Error(500, 'User already exists');
    }
  };

  loginUser = function(params, session){
    this.unblock();
    console.log('*** example-server.js loginUser ***');
    console.log('example-server.js loginUser params: ' + JSON.stringify(params));
    console.log('session: ' + JSON.stringify(session));
    var user = Users.findOne({username: params.username, password: params.password});
    if( user ){

      /**
      * Concept #1 - Load Permanence
      * You can load a session up with the user.username
      * This is a handy way to load a permanent session if the user has 
      * deleted their cookies or is using a different browser or computer or
      * if they have more than one login/profile.
      * We are going to load saved permanent sessions by username because 
      * that is how we associated them.
      **/
      console.log('*** example-server.js loginUser before Sessie.setloadPermanentSession ***');
      //sanity check before calling for loading of a permanent session
      console.log('*** example-server.js loginUser params.username: ' + params.username);
      console.log('*** example-server.js loginUser session.permanent_id: ' + session.permanent_id);
      //we are doing a sanity check and not calling the server function to reduce work load
      //the server does the same sanity check
      if(params.username !== session.permanent_id){
        console.log('*** example-server.js NOT EQUAL calling setLoadPermanentSession');
        var loaded_session = Sessie.setLoadPermanentSession(params.username, session);
        if(loaded_session){
          console.log('*** example-server.js we have a loaded session');
          console.log('*** example-server.jsloaded session: ' + JSON.stringify(loaded_session));
          var options = {};
          options.mutable = false;
          options.visible = true;
          options.meteorized = true;
          Sessie.setLochSessionData(loaded_session, 'logged_in', true, options);
        } else {
          console.log('*** example-server.js no loaded session');
          console.log('*** example-server.js loaded session: ' + JSON.stringify(loaded_session));
        }
      } else {
        console.log('*** example-server.js EQUAL no loading crap');
        var options = {};
        options.mutable = false;
        options.visible = true;
        options.meteorized = true;
        Sessie.setLochSessionData(session, 'logged_in', true, options);
      }
      
      /**
      * Concept #2 - Set Permanence
      * You could just set whatever session and session variables exist in the current
      * session as permanently associated with whatever user just logged in.
      * This could create issues if you have previous permanent sessions associated 
      * with the permanent_id.
      * In this example we are not using this because we set permanence on sign up.
      * Even if you set permanence on sign up you can still set permanence on login if you want.
      * Be careful using this concept.
      * Sessie.setPermanent(session, params.username);
      * var options = {};
      * options.mutable = false;
      * options.visible = true;
      * options.meteorized = true;
      * Sessie.setLochSessionData(session, 'logged_in', true, options);
      **/
      return 'Successful Login';
    } else {
      throw new Meteor.Error(500, 'Invalid login');
    }
  };

  logoutUser = function(session){
    //this could be done client side but would not be as secure
    this.unblock();
    console.log('*** example-server.js logoutUser ***');
    var options = {};
    options.mutable = false;
    options.visible = true;
    options.meteorized = true;
    Sessie.setLochSessionData(session, 'logged_in', false, options);
    return 'Successful Logout';
  };

  unsetPermanence = function(session){
    //normally you would not wire this up to the front end
    //this is just a demo
    this.unblock();
    console.log('*** example-server.js unsetPermanence ***');
    Sessie.unsetPermanent(session);
    return 'Successfully unset permanence';
  };

  Meteor.methods({
    registerUser: registerUser,
    loginUser: loginUser,
    logoutUser: logoutUser,
    unsetPermanence: unsetPermanence
  });



  //below is all the All Your Sessions Belong to Us automation

  //Meteor.setInterval(alterSession, 30000);

  function alterSession(){
    console.log('*** alterSession ***');
    // This is merely for purposes of an example
    // it is not intended for real purposes in your production code
    // it uses the SessieSessions collection in order to loop over all active sessions
    // and randomly add up to 9 total records and randomly change records.
    // this is the example documented in All your session are belong to us
    var sessions = SessieSessions.find();
    sessions.forEach(function (session) {
      //NOT WORKING NOW
      var session2 = {};
      console.log('alterSession session._id: ' + session._id);
      var lochs = SessieLoch.find({session_id: session._id});
      var loch_count = lochs.count();
      console.log('alterSession Loch COUNT: ' + loch_count);
      //we had to do this to pass the correct structure to setLochData
      session2.session_id = session._id;
      session2.session_key = session.key;
      var options = {};
      options.mutable = true;
      options.visible = true;
      options.meteorized = true;

      if(loch_count < 9){
        console.log('alterSession ADDING RECORD');
        var r1=Math.floor(Math.random()*1000);
        // this is the server side call to set Session Loch Data
        Sessie.setLochSessionData(session2, 'sessie_generated_' + r1, 'random_value_' + r1, options);
      }
      if(loch_count >5){

        console.log('alterSession CHANGING RECORDS');
        
        var records = lochs.fetch();

        var r2=Math.floor(Math.random()*(loch_count-1));
        console.log('alterSession changing record[' + r2 + '].name value: ' + records[r2].name);
        var r3=Math.floor(Math.random()*1000);
        var r =  Math.floor(Math.random()*11);
        console.log('mutable r: ' + r);
        if(r <= 3){
          options.mutable = false;
        } else {
          options.mutable = true;
        }
        r =  Math.floor(Math.random()*11);
        console.log('visible r: ' + r);
        if(r <= 3){
          options.visible = false;
        } else {
          options.visible = true;
        }
        r =  Math.floor(Math.random()*11);
        console.log('meteorized r: ' + r);
        if(r <= 3){
          options.meteorized=false;
        } else {
          options.meteorized=true;
        }
        // this is the server side call to set Session Loch Data
        Sessie.setLochSessionData(session2, records[r2].name, 'sessie_changed_' + r3, options);  

        console.log('alterSession DELETING RECORDS');
        var r2=Math.floor(Math.random()*(loch_count-1));
        console.log('alterSession delete records[' + r2 + '].name: ' + records[r2].name);
        // this is the server side sessie loch session variable delete
        Sessie.deleteLochSessionData(session2, records[r2].name);
      }

    });
  }
}