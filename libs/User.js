var async = require("async");

var Message = require("./Message.js");


var User = function (data) {
  var self = this;
  var name = "anonymous";
  var rooms = [];
  var socket = data.socket;
  var roomsManager = data.roomsManager;
  var userManager = data.userManager;
  
  this.getName = function (data, callback) {
    return callback(null, name);
  };
  
  this.getAllRoom = function (data, callback) {
    console.log("getAllRoom");
    
    roomsManager.serializeAllRoom(null, function (err, rooms) {
      if (err) return callback(err);
      var params = {
        action: "roomList"
        , rooms: rooms
      };
      self.notify(params);  
      return callback();
    });
  };
  
  this.notify = function (data, callback) {
    socket.emit("out", data);
    if (callback) return callback();
  };
  
  this.joinRoom = function (data, callback) {
    
    roomsManager.get(data.roomName, function (err, room) {
      rooms.push(room);
      
      if (err) return callback(err);
      var addUser = function (callback) {
        room.addUser(self, callback);
      };
  
      var serialize = function (callback) {
        room.serializeAll(null, callback);
      };
      
      var notify = function (job, callback) {
        job.action = "joinRoom";
        self.notify(job, function () {});
      };
      
      var jobs = [addUser, serialize, notify];
      async.waterfall(jobs);
    });
  };

  this.quitRoom = function (data, callback) {
    
  };

  this.newMessage = function (data, callback) {
    roomsManager.get(data.roomName, function (err, room) {
      if (err) return callback(err);
      data.user = self;
      data.room = room;
      // data.message = data.message
      
      var message = new Message(data);
      data.message = message;
      room.addMessage(data, callback);
    });
  };
  
  this.setName = function (data, callback) {
    name = data.name;
    
    async.map(rooms, function (room, callback) {
      return rooms.broadcastUsers(callback);
    }, callback);
  };
  
  this.disconnect = function (data, callback) {
    async.map(rooms, function (room, callback) {
      room.removeUser(self, callback);
    });
    userManager.removeUser(self, function () {
      self = undefined;
      socket = undefined;
      rooms = undefined;
      name = undefined;
      roomsManager = undefined;
      userManager = undefined;
    });
  };
  
  if (socket) {
    socket.on('disconnect', function(){
      console.log(name, 'disconnected');
      self.disconnect(null, function () {});
    });
    
    socket.on("error", function (err) {
      console.error("ERROR on socket", err);
    });
    
    socket.on("in", function (jobs) {
      if (!(jobs instanceof Array)) return console.error("ERROR: user.on(in, data). data need to be an array");
      
      for (var i = 0; i < jobs.length; i++) {
        var job = jobs[i];
        if (!(job.action in self)) return console.error("ERROR: action: " + job.action + " not found");
        console.log("call function :", job.action);
        self[job.action](job, function (err) {
          if (err) console.log("ERROR:", err);
        });
      }
    });
  }
};

module.exports = User;
  