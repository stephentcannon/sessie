//leaving this wrapped just in case
if (Meteor.is_client) {

  Template.main.sessionId = function () {
    var session = SessieSessions.findOne();
    if (session) {
      return session._id;
    }
  };

  Template.main.sessionKey = function () {
    var session = SessieSessions.findOne();
    if (session) {
      return session.key;
    }
  };

  Template.main.sessionExpires = function () {
    var session = SessieSessions.findOne();
    if (session) {
      return session.expires;
    }
  };

  Template.main.sessionExpiry = function () {
    var session = SessieSessions.findOne();
    if (session) {
      return session.expiry;
    }
  };

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
      //console.log('options.mutable: ' + options.mutable);
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
  }

  validateParams = function(params) {
    for (var key in params) {
      value = params[key];
      if(_.isEmpty(value) || _.isUndefined(value) || 
      _.isNull(value)) {
        throw new Meteor.Error(600, 'Please enter your "'+ key + '".');
      }
    }
  }

  Template.GetSessieLoch.GetSessieLoch = function(){
    console.log('*** Template.GetSessieLoch.GetSessieLoch ***');
    //console.log('session.get("getSessieLochSearchValue"): ' + Session.get("getSessieLochSearchValue"));
    var obj = Sessie.getLochData(Session.get("getSessieLochSearchValue"));
    //console.log('obj: ' + JSON.stringify(obj));
    // i think this might work too return obj.name && obj.value;
    if(obj){
      console.log('obj.name: ' + obj.name);
      console.log('obj.value: ' + obj.value);
      //return JSON.stringify(obj);// && obj.name && obj.value;
      return obj;
    } else {
      return null;
    }
    
  }

  Template.SessieLoch.SessieLoch = function() {
    //console.log('*** Template.SessieLoch.SessieLoch  ***');
    return Sessie.getLoch();
  };

  Template.meteorsessionvars.session = function () {
    map = []
    for (prop in Session.keys) {
       if(prop.indexOf('session_id') == -1 && 
        prop.indexOf('session_key') == -1 &&
        prop.indexOf('getSessieLochSearchValue') == -1){
        map.push({key: prop, value: Session.get(prop)})
      }
    }
    return map
  }

}