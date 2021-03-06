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
    if(username){
      return Users.find( { username: username });
    } else {
      return
    }  
  });

  registerUser = function(params, session){
    this.unblock();
    validateParams(params);
      //we are going to insert the Sessie session_id in with our Users records just for the sake of it
      //you might want to consider making sure the session isn't already registered to another user
    if( Users.find({username: params.username}).count() === 0 ){
      id = Users.insert({ 
        created: new Date(),
        username: params.username,
        password: params.password,
        session_id: session.session_id
      });
      if(id){
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
      //sanity check before calling for loading of a permanent session
      //we are doing a sanity check and not calling the server function to reduce work load
      //the server does the same sanity check
      if(params.username !== session.permanent_id){
        var loaded_session = Sessie.loadPermanentSession(params.username, session);
        if(loaded_session){
          var options = {};
          options.mutable = false;
          options.visible = true;
          options.meteorized = true;
          Sessie.setLochSessionData(loaded_session, 'logged_in', true, options);
        } else {
          //console.log('*** example-server.js no loaded session you could do something here if you want');
        }
      } else {
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
    if(session.permanent_id){
      Sessie.unsetPermanent(session);
    }
    return 'Successfully unset permanence';
  };

  unloadPermanent = function(session){
    //normally you would not wire this up to the front end
    //this is just a demo
    this.unblock();
    if(session.permanent_id){
      Sessie.unloadPermanentSession(session);
    }
    return 'Successfully unset permanence';
  };

  Meteor.methods({
    registerUser: registerUser,
    loginUser: loginUser,
    logoutUser: logoutUser,
    unsetPermanence: unsetPermanence,
    unloadPermanent: unloadPermanent,
  });



  //below is all the All Your Sessions Belong to Us automation

  Meteor.setInterval(alterSession, 30000);

  function alterSession(){
    // This is merely for purposes of an example
    // it is not intended for real purposes in your production code
    // it uses the SessieSessions collection in order to loop over all active sessions
    // and randomly add up to 9 total records and randomly change records.
    // this is the example documented in All your session are belong to us
    var sessions = SessieSessions.find();
    sessions.forEach(function (session) {
      //NOT WORKING NOW
      var session2 = {};
      var lochs = SessieLoch.find({session_id: session._id});
      var loch_count = lochs.count();
      //we had to do this to pass the correct structure to setLochData
      session2.session_id = session._id;
      session2.session_key = session.key;
      var options = {};
      options.mutable = true;
      options.visible = true;
      options.meteorized = true;

      if(loch_count < 9){
        var r1=Math.floor(Math.random()*1000);
        // this is the server side call to set Session Loch Data
        Sessie.setLochSessionData(session2, 'sessie_generated_' + r1, 'random_value_' + r1, options);
      }
      if(loch_count >5){
        var records = lochs.fetch();
        var r2=Math.floor(Math.random()*(loch_count-1));
        var r3=Math.floor(Math.random()*1000);
        var r =  Math.floor(Math.random()*11);
        if(r <= 3){
          options.mutable = false;
        } else {
          options.mutable = true;
        }
        if(r <= 3){
          options.visible = false;
        } else {
          options.visible = true;
        }
        r =  Math.floor(Math.random()*11);
        if(r <= 3){
          options.meteorized=false;
        } else {
          options.meteorized=true;
        }
        // this is the server side call to set Session Loch Data
        Sessie.setLochSessionData(session2, records[r2].name, 'sessie_changed_' + r3, options);  
        var r2=Math.floor(Math.random()*(loch_count-1));
        // this is the server side sessie loch session variable delete
        Sessie.deleteLochSessionData(session2, records[r2].name);
      }

    });
  }
}