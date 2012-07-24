//leaving this wrapped just in case
if (Meteor.is_client) {
  Meteor.startup(function () {
    Meteor.autosubscribe(function() {
      if(Sessie.getLochData('logged_in') === true){
        Meteor.subscribe("Users", Sessie.getSessionPermanentId());
      }
    });
  });

  Template.main.sessionId = function () {
    return Sessie.getSessionId();
  };

  Template.main.sessionKey = function () {
    return Sessie.getSessionKey();
  };

  Template.main.sessionCreated = function() {
    return Sessie.getSessionCreated();
  };

  Template.main.sessionExpires = function () {
    return Sessie.getSessionExpires();
  };

  Template.main.sessionExpiry = function () {
    return Sessie.getSessionExpiry();
  };

  Template.main.sessionPermanent = function () {
    return Sessie.getSessionPermanentId();
  };

  Template.permanents_output.sessionPermanent = function () {
    return Sessie.getSessionPermanentId();
  };

  Template.permanents_output.sessionExpires = function () {
    return Sessie.getSessionExpires();
  };

  Template.permanents_output.sessionExpiry = function () {
    return Sessie.getSessionExpiry();
  };

  Template.permanents_output.loggedin = function () {
    var sessionData = Sessie.getLochData('logged_in');
    if (sessionData) {
      return sessionData.value;
    } else {
      return null;
    }
  };

  Template.main.is_loggedin = function(){
    var sessionData = Sessie.getLochData('logged_in');
    if (sessionData) {
      return sessionData.value;
    } else {
      return false;
    }
  }

  //An example of storing data in a Sessie.Loch
  Template.lochform.events = {
    'click #btnLoch': function (event) { 
      event.preventDefault();
      event.stopPropagation();
      event.stopImmediatePropagation();
      var params = $('#loch-form').toJSON();
      var options = {};
      options.mutable = (params.inputMutable === "true")? true:false;
      options.visible = (params.inputVisible === "true")? true:false;
      options.meteorized = (params.inputMeteorized === "true")? true:false;
      try{
        validateParams(params);
        Sessie.setLochData(params.inputName, params.inputValue, options);
        $("#loch-form").reset();
        $("#inputName").focus();
      } catch(error) {
        Alert.setAlert('ERROR', error.reason, 'alert-error', 'loch');
      }
    }
  };

  //example of unsetting permance from front, normally just call it on back end
  Template.permanents_output.events = {
    'click #btnUnset': function(event){
      event.preventDefault();
      event.stopPropagation();
      event.stopImmediatePropagation();
      Meteor.call('unsetPermanence', Sessie.getSession(), function(error, result){
        if(result){
          //console.log('unsetPermanence worked result: ' + result);
        } else {
          //console.log('unsetPermanence did not work error: ' + JSON.stringify(error));
        }
      });
    },
    'click #btnUnload': function(event){
      event.preventDefault();
      event.stopPropagation();
      event.stopImmediatePropagation();
      // we are clearing the Meteor.session elements here and did not feel it belongs in the package
      clearMeteorSession();
      Meteor.call('unloadPermanent', Sessie.getSession(), function(error, result){
        if(result){
          //console.log('unloadPermanent worked result: ' + result);
        } else {
          //console.log('unloadPermanent did now work error: ' + JSON.stringify(error));
        }
      });
    }
  };

  //example of logging out
  Template.logout_form.events = {
    'click #btnLogout': function(event){
      event.preventDefault();
      event.stopPropagation();
      event.stopImmediatePropagation();
      Meteor.call('logoutUser', Sessie.getSession(), function (error, result) { 
        if(result){
          //console.log('logout worked result: ' + result);
        } else {
          //console.log('logout did not work error: ' + error);
        }
      });
    }
  };

  //example of user registration to create permanent session
  Template.permanents_form.events = {
    'click .btn': function(event){
      event.preventDefault();
      event.stopPropagation();
      event.stopImmediatePropagation();
      var params = $('#reg-form').toJSON();
      try{
        validateParams(params);
        Meteor.call(event.target.textContent+'User', params, Sessie.getSession(), function (error, result) { 
          if(result){
            Alert.setAlert('SUCCESS', 'Success', 'alert-success', 'reg');
          } else {
            if(error.reason){
              Alert.setAlert('ERROR', error.reason, 'alert-error', 'reg');
            } else {
              Alert.setAlert('ERROR', 'Unknown error', 'alert-error', 'reg');
            }
          }
        });
        $("#username").focus();
      }catch(error){
        Alert.setAlert('ERROR', 'Unknown error', 'alert-error', 'reg');
      }
    }
  };


  //example of delete items from the front end
  Template.lochdata.events = {
    'click i': function(event){
      event.preventDefault();
      event.stopPropagation();
      event.stopImmediatePropagation();
      var curT = event.currentTarget; 
      var clickedElement = event.target; 
      Sessie.deleteLochData(this.name);
    }
  }
  //example of retrieving a session element
  Template.getlochform.events = {
    'click #btnGetLoch': function(event){
      event.preventDefault();
      event.stopPropagation();
      event.stopImmediatePropagation();
      var params = $('#getloch-form').toJSON();
      try{
        validateParams(params);
        Session.set("getSessieLochSearchValue", params.searchName);
        $("#getloch-form").reset();
        $("#searchName").focus();
      } catch(error){
        var errormsg;
        if(error.message){
          errormsg = error.message;
        }else if(error.reason){
          errormsg = error.reason;
        }else{
          errormsg = 'Unknown error';
        }
        Alert.setAlert('ERROR', errormsg, 'alert-error', 'getloch');
      }
    }
  };
  //example of delete a session element
  Template.GetSessieLoch.events = {
    'click i': function(event){
      event.preventDefault();
      event.stopPropagation();
      event.stopImmediatePropagation();
      var curT = event.currentTarget; 
      var clickedElement = event.target; 
      Sessie.deleteLochData(this.name);
    }
  };

  
  Template.GetSessieLoch.GetSessieLoch = function(){
    var obj = Sessie.getLochData(Session.get("getSessieLochSearchValue"));
    if(obj){
      return obj;
    } else {
      return null;
    }
    
  };

  Template.SessieLoch.SessieLoch = function() {
    return Sessie.getLoch();
  };

  function clearMeteorSession() {
    //best we can do for now because can't delete session.key/value parameters
    //they seem to expire when set to undefined
    for (key in Session.keys) {
      if(prop.indexOf('session_id') == -1 && 
        prop.indexOf('session_key') == -1 &&
        prop.indexOf('sessie_id') == -1){
          Session.set(key, undefined);
      }
    }
  }

  Template.meteorsessionvars.session = function () {
    map = []
    for (prop in Session.keys) {
       if(prop.indexOf('session_id') == -1 && 
        prop.indexOf('session_key') == -1 &&
        prop.indexOf('getSessieLochSearchValue') == -1 &&
        prop.indexOf('sessie_id') == -1){
        map.push({key: prop, value: Session.get(prop)})
      }
    }
    return map
  };

  function loginUser(params){
    //this is just a client stub
  }

  function logoutUser(params){
    //this is just a client stub
  }

  function registerUser(params){
    //this is just a client stub
  }

  function unsetPermanence(params){
    //this is just a client stub
  }

  function unloadPermanent(params){
    //this is just a client stub
  }


  Meteor.methods({
    registerUser: registerUser,
    loginUser: loginUser,
    unsetPermanence: unsetPermanence,
    unloadPermanent: unloadPermanent
  });

}