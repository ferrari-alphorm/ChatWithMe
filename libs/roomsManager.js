var async = require("async");

var Room = require("./Room.js");

var rooms = [];

var RoomsManager = function () {
  var room = new Room();
  room.load({roomName: "rainbow"}, function () {});
  rooms.push(room);
  room = new Room();
  room.load({roomName: "warrior"}, function () {});
  rooms.push(room);
  
  this.add = function (roomName, callback) {
    var room = new Room();
    room.load({ name: roomName }, function (err, data) {
      if (err) return callback(err);
      rooms.push(room);
      return callback(null, room);
    });
  };
  
  this.remove = function (room, callback) {
    
  };
  
  this.get = function (roomName, callback) {
    var found = false;
    for (var i = 0; (i < rooms.length) || !found; i++) {
      // exception of async rule loop, getName is synchrone !
      rooms[i].getName(null, function (err, name) {
        if (err) return function () {};
        if (name == roomName) {
          found = true;
          return callback(null, rooms[i]);  
        }
      });
    }
    if (found) return ;
    this.add(roomName, callback);
  };
  
  this.serializeAllRoom = function (data, callback) {
    async.map(rooms, function (room, callback) {
      var getRoomName = function (callback) { return room.getName(null, callback); };
      var getUsersNumber = function (callback) { 
        room.getUsers(null, function(err, users) {
          if (err) return callback(err);
          return callback(null, users.length);   
        });
      };
      var jobs = {roomName: getRoomName, usersNumber: getUsersNumber};
      async.parallel(jobs, function (err, results) {    
        if (err) return callback(err);
        
        var serializeRoom = { roomName: results.roomName
          , usersNumber: results.usersNumber 
        };
        return callback(null, serializeRoom);
      });
    }, callback);
  };
};

module.exports = new RoomsManager();