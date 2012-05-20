Sessie
------------
Sessie is a weird and simple attempt at a server side session management package for Meteor. [meteor.com](http://www.meteor.com).

View live
------------
[sessie.meteor.com](http://sessie.meteor.com)

How to Demo
------------

Install Meteor:

    [meteor.com](http://www.meteor.com)
    or
    [meteor on github](https://github.com/meteor/meteor)

Then you can clone the code onto your system:

    git clone git://github.com/stephentcannon/sessie.git

Run or deploy:
    
    To run
    cd sessie
    meteor 

    To deploy
    cd sessie
    meteor deploy [yourlocation].meteor.com

Reset data:
  
  To reset all data
  cd sessie
  meteor reset
  meteor

How to Use
------------
copy the lowest level sessie directory to your meteor packages directory
in your project directory
  meteor add sessie

Todo
------------
  loch
  ness library - references to collections that contain items related to a session.
  monster library - destroys items in ness tracked collections when a session is destroyed.
  extend meteor sessions 
  reactivity

License
------------
MIT