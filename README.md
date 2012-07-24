Sessie
------------
Sessie is a weird and simple attempt at a server side session management package for Meteor. [Meteor](http://www.meteor.com).

View live
------------
[sessie.meteor.com](http://sessie.meteor.com)

How to Demo
------------

Install Meteor:

    [meteor.com](http://www.meteor.com)
    or
    [meteor on github](https://github.com/meteor/meteor)

Clone Code:

    git clone git://github.com/stephentcannon/sessie.git

Run Demponstration:
    
    cd sessie
    meteor 

Reset Demonstration Data:
  
  cd sessie
  meteor reset

How to Use
------------
  copy or symlink the lowest level sessie directory to your meteor packages directory
  in your project directory
    meteor add sessie
    create a /client/config-sessie-client.js
    create a /server/config-sessie-server.js

TODO
--------

  1.  Need to work on the Meteor Session stuff.  It doesn't clear between changes of permanet session loads.

  2.  Expand Loch session variables to support editable and deletable instead or in addition to mutable. 

License
------------
MIT