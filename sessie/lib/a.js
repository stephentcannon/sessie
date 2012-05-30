//we put this here bcuz apparently /lib/ gets loaded early as do files alphabetically
Sessie = {};
SessieSession = new Meteor.Collection('sessieSession');
SessieSessions = new Meteor.Collection('sessieSessions');
SessieLoch = new Meteor.Collection('sessieLoch');
SessieNess = new Meteor.Collection('sessieNess');

