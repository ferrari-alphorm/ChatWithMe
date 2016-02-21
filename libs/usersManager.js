var roomsManager = require("./roomsManager.js");
var User = require("./User.js");

var users = [];

var UsersManager = function () {
  var self = this;

  this.new = function (socket) {
    var user = new User({socket: socket
      , roomsManager: roomsManager
      , userManager: self
    });
  
    users.push(user);
  };
  
  this.removeUser = function (user, callback) {
    users.splice(users.indexOf(user), 1);
  };
};

module.exports = new UsersManager();