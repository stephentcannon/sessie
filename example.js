if (Meteor.is_client) {

  Template.main.sessionId = function () {
    var session = Sessie.Sessions.findOne();
    if (session) {
      return session._id;
    }
  };

  Template.main.sessionKey = function () {
    var session = Sessie.Sessions.findOne();
    if (session) {
      return session.key;
    }
  };

  Template.main.sessionExpires = function () {
    var session = Sessie.Sessions.findOne();
    if (session) {
      return session.expires;
    }
  };

  Template.main.sessionExpiry = function () {
    var session = Sessie.Sessions.findOne();
    if (session) {
      return session.expiry;
    }
  };

  //An example of storing data in a Sessie.Loch
  Template.lochform.events = {
    'click #btnLoch': function (event) { 
      event.preventDefault();
      event.stopImmediatePropagation();
      console.log('lochform button clicked');
      var params = $('#loch-form').toJSON();
      console.log('params.inputName: ' + params.inputName);
      console.log('params.inputValue: ' + params.inputValue);
      try{
        validateParams(params);
        console.log('after lochform validate params');
        Sessie.setLochData(params.inputName, params.inputValue);
        $("#loch-form").reset();
        $("#inputName").focus();
      } catch(error) {
        Alert.setAlert('ERROR', error.reason, 'alert-error', 'loch');
      }
    }
  };

  Template.lochform.events = {
    'click #btnLoch': function (event) { 
      event.preventDefault();
      event.stopImmediatePropagation();
      console.log('lochform button clicked');
      var params = $('#loch-form').toJSON();
      console.log('params.inputName: ' + params.inputName);
      console.log('params.inputValue: ' + params.inputValue);
      try{
        validateParams(params);
        console.log('after lochform validate params');
        Sessie.setLochData(params.inputName, params.inputValue);
        $("#loch-form").reset();
        $("#inputName").focus();
      } catch(error) {
        Alert.setAlert('ERROR', error.reason, 'alert-error', 'loch');
      }
    }
  };
  
  Template.lochdata.events = {
    'click i': function(event){
      event.preventDefault();
      event.stopImmediatePropagation();
      console.log('i clicked');
      var curT = event.currentTarget; 
      console.log('curT.id: ' + curT.id);
      console.log('curT.className: ' + curT.className);
      var clickedElement = event.target; 
      console.log('clickedElement.id: ' + clickedElement.id);
      console.log('clickedElement.className: ' + clickedElement.className);
      console.log('this: ' + JSON.stringify(this,0,4));
      Sessie.deleteLochData(this.name);
    }
  }

  Template.getlochform.events = {
    'click #btnGetLoch': function(event){
      event.preventDefault();
      event.stopImmediatePropagation();
      console.log('getlochform button clicked');
      var params = $('#getloch-form').toJSON();
      try{
        validateParams(params);
        console.log('after getlochform validate params');
        //r = Sessie.getLochData(params.searchName);
        //console.log(r);
        //$("#searchResultName").text(r.name);
        //$("#searchResultValue").text(r.value);
        //$("#searchResultAction").html('<i class="icon-trash"></i>');
        console.log('getlochform params.searchName: ' + params.searchName);
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

  Template.GetSessieLoch.events = {
    'click i': function(event){
      event.preventDefault();
      event.stopImmediatePropagation();
      console.log('i clicked');
      var curT = event.currentTarget; 
      console.log('curT.id: ' + curT.id);
      console.log('curT.className: ' + curT.className);
      var clickedElement = event.target; 
      console.log('clickedElement.id: ' + clickedElement.id);
      console.log('clickedElement.className: ' + clickedElement.className);
      console.log('this: ' + JSON.stringify(this,0,4));
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
    console.log('session.get("getSessieLochSearchValue"): ' + Session.get("getSessieLochSearchValue"));
    x =  Sessie.getLochData(Session.get("getSessieLochSearchValue"));
    console.log(x);
    return Sessie.getLochData(Session.get("getSessieLochSearchValue"));
  }

  Template.SessieLoch.SessieLoch = function() {
    console.log('*** Template.SessieLoch.SessieLoch  ***');
    // TODO abstract this into Sessie client.js should never have to call collection direclty
    //return Sessie.Loch.find();
    return Sessie.getLoch();
  };

}

if(Meteor.is_server) {
  Meteor.setInterval(alterSession, 30000);

  function alterSession(){
    console.log('*** alterSession ***');
    // This is merely for purposes of an example and not intended for real purposes on your server
    var sessions = Sessie.Sessions.find();
    sessions.forEach(function (session) {
      //NOT WORKING NOW
      var session2 = {};
      console.log('alterSession session._id: ' + session._id);
      var lochs = Sessie.Loch.find({session_id: session._id});
      var loch_count = lochs.count();
      console.log('alterSession Loch COUNT: ' + loch_count);
      //we had to do this to pass the correct structure to setLochData
      session2.session_id = session._id;
      session2.session_key = session.key;
      if(loch_count < 9){
        console.log('alterSession ADDING RECORD');
        var r1=Math.floor(Math.random()*1000);
        Sessie.setLochData(session2, 'sessie_generated_' + r1, 'random_value_' + r1);
      }
      if(loch_count >0){
        console.log('alterSession CHANGING RECORDS');
        var records = lochs.fetch();
        var r2=Math.floor(Math.random()*(loch_count-1));
        console.log('alterSession records[' + r2 + '].name: ' + records[r2].name);
        var r3=Math.floor(Math.random()*1000);
        Sessie.setLochData(session2, records[r2].name, 'sessie_changed_' + r3);
      }

    });
  }
}