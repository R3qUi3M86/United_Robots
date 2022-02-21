# United_Robots
Fleet management&control - software general concept

#I. Whole system is composed of 3 modules:
1. Web service which can be hosted on cloud like Heroku for example.
2. Operator application which can also be hosted as separate Web-service (sub-module of Web service(1)) or application written in native language for mobile device.
3. Robot which is a state emulator of physical robot device to demonstrate system functionality.

#II. Modules functionality is as follows:
1. Web-Service:
   a) monitoring robots activity
   b) monitoring robots connection status 
   c) monitoring robots map position
   c) uploading maps to robots
   d) downloading maps from robots (currently button is just place-holder)
   e) sharing robots status information with connected and authorized operators (working as data relay)
2. Operator application:
   a) monitoring currently connected robots activity
   b) monitoring robots connection status
   c) monitoring robots map position
   e) issuing commands:
      - setting robot map-in-use
      - power up/shutdown
      - move up/down/left/right
      - move to location (click on map)
   f) sharing robots status information with Web-service(1) (working as data relay)
3. Robot emulator:
   a) holding current robot state
   b) displaying detailed robot state (log data)
   c) broadcasting robot state information to Web-service and connected (authorized) Operator
   d) taking commands from authorized operator
   e) stops traveling when no connection to Web-Service or Operator is available
   f) emulate connection failure with Operator/Web-Service or both

#III. In order to use the app system do the following:
1. Launch web-service app as flask application (works on localhost:5000)
2. Launch any of the robots (or any combination of the three):
   a) Cleaner (does cleaning action, works on localhost:5001)
   b) Terminator (his action is related to his mission, works on localhost:5002)
   c) Annihilator (doesn't like other robots, works on localhost:5003)
    NOTE: In order for emulator to work properly you need to also open the browser and type it's address. It's assumed that robot physical antena is the front end browser.
3. Launch operator application (works on localhost:5050)


#NOTES
Currently the main state sharing module is flask_socketio which needs JS socket.io client. For future development better would be if operator app backend communicated directly with Web-Service back-end (currently Operator front end communicates with Web-Service back-end API)

