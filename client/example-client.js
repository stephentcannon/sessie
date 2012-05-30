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
    //console.log('*** is_loggedin ***');
    var sessionData = Sessie.getLochData('logged_in');
    if (sessionData) {
      //console.log('returning: ' + sessionData.value);
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
      //console.log('lochform button clicked');
      var params = $('#loch-form').toJSON();
      //console.log('params.inputName: ' + params.inputName);
      //console.log('params.inputValue: ' + params.inputValue);
      //console.log('params.inputMutable: ' + params.inputMutable);
      //console.log('params.inputVisible: ' + params.inputVisible);
      //console.log('params.inputMeteorized: '+ params.inputMeteorized);
      var options = {};
      options.mutable = (params.inputMutable === "true")? true:false;
      options.visible = (params.inputVisible === "true")? true:false;
      options.meteorized = (params.inputMeteorized === "true")? true:false;
      //console.log('options: ' + options);
      try{
        validateParams(params);
        //console.log('after lochform validate params');
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
      console.log('*** Template.permanents_output.events btnUnset click***');
      event.preventDefault();
      event.stopPropagation();
      event.stopImmediatePropagation();
      Meteor.call('unsetPermanence', Sessie.getSession(), function(error, result){
        if(result){
          console.log('unsetPermanence worked?' + result);
        } else {
          console.log('unsetPermanence did not work' + JSON.stringify(error));
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
          console.log('logout worked?' + result);
        } else {
          console.log('logout did not work' + error);
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
        //validateParams(params);
        Meteor.call(event.target.textContent+'User', params, Sessie.getSession(), function (error, result) { 
          console.log('result: ' + result);
          console.log('error: ' + error);
          if(result){
            console.log('registerUser SUCCESS: ' + result);
            Alert.setAlert('SUCCESS', 'Success', 'alert-success', 'reg');
          } else {
            console.log('registerUser ERROR: ' + JSON.stringify(error));
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
      //console.log('i clicked');
      var curT = event.currentTarget; 
      //console.log('curT.id: ' + curT.id);
      //console.log('curT.className: ' + curT.className);
      var clickedElement = event.target; 
      //console.log('clickedElement.id: ' + clickedElement.id);
      //console.log('clickedElement.className: ' + clickedElement.className);
      //console.log('this: ' + JSON.stringify(this,0,4));
      Sessie.deleteLochData(this.name);
    }
  }
  //example of retrieving a session element
  Template.getlochform.events = {
    'click #btnGetLoch': function(event){
      event.preventDefault();
      event.stopPropagation();
      event.stopImmediatePropagation();
      //console.log('getlochform button clicked');
      var params = $('#getloch-form').toJSON();
      try{
        validateParams(params);
        //console.log('after getlochform validate params');
        //console.log('getlochform params.searchName: ' + params.searchName);
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
      //console.log('i clicked');
      var curT = event.currentTarget; 
      //console.log('curT.id: ' + curT.id);
      //console.log('curT.className: ' + curT.className);
      var clickedElement = event.target; 
      //console.log('clickedElement.id: ' + clickedElement.id);
      //console.log('clickedElement.className: ' + clickedElement.className);
      //console.log('this: ' + JSON.stringify(this,0,4));
      Sessie.deleteLochData(this.name);
    }
  };

  
  Template.GetSessieLoch.GetSessieLoch = function(){
    //console.log('*** Template.GetSessieLoch.GetSessieLoch ***');
    //console.log('session.get("getSessieLochSearchValue"): ' + Session.get("getSessieLochSearchValue"));
    var obj = Sessie.getLochData(Session.get("getSessieLochSearchValue"));
    //console.log('obj: ' + JSON.stringify(obj));
    // i think this might work too return obj.name && obj.value;
    if(obj){
      //console.log('obj.name: ' + obj.name);
      //console.log('obj.value: ' + obj.value);
      //return JSON.stringify(obj);// && obj.name && obj.value;
      return obj;
    } else {
      return null;
    }
    
  };

  Template.SessieLoch.SessieLoch = function() {
    //console.log('*** Template.SessieLoch.SessieLoch  ***');
    return Sessie.getLoch();
  };

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
    //console.log('STUB loginUser');
  }

  function logoutUser(params){
    //this is just a client stub
    //console.log('STUB logoutUser');
  }

  function registerUser(params){
    //this is just a client stub
    //console.log('STUB registerUser');
  }

  function unsetPermanence(params){
    //this is just a client stub
  }


  Meteor.methods({
    registerUser: registerUser,
    loginUser: loginUser,
    unsetPermanence: unsetPermanence
  });

}