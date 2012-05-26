//leaving this wrapped just in case
if(Meteor.is_server) {
  //Meteor.setInterval(alterSession, 5000);

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