var async = require("async");

var Message = require("./Message.js");
var User = require("./User.js");

//var model = require("./modelsManager.js").init({model: 'mysql'});
//var model = require("./modelsManager.js").init({model: 'sequelize'});
var model = require("./modelsManager.js").init({model: 'mongodb'});
model.init(null, function () {}, function () {});

var Room = function() {
  var self = this;
  var messages = [];
  var users = [];
  var roomName;

  this.getName = function(data, callback) {
    return callback(null, roomName);
  };

  this.getUsers = function(data, callback) {
    return callback(null, users);
  };

  this.addMessage = function(data, callback) {

    var push = function(callback) {
      messages.push(data.message);
      return callback();
    };

    var loadData = function(callback) {
      var getMessage = function(callback) {
        return data.message.getMessage(null, callback);
      };
      var getUsername = function(callback) {
        return data.user.getName(null, callback);
      };

      var jobs = {
        message: getMessage,
        username: getUsername
      };
      async.parallel(jobs, function(err, results) {
        if (err) return callback(err);

        var params = {
          message: results.message,
          roomName: roomName,
          username: results.username,
          date: new Date().toISOString()
        };
        return callback(null, params);
      });
    };

    var saveInModel = function(params, callback) {
      model.saveMessage(params, function (err) {
        if (err) return callback(err);
        return callback(null, params);
      });
    };

    var broadcast = function(params, callback) {
      self.broadcastNewMessage(params, callback);
    };

    var jobs = [push, loadData, saveInModel, broadcast];
    async.waterfall(jobs, callback);
  };

  this.addUser = function(user, callback) {
    users.push(user);
    self.broadcastAllNewUser(user, function() {});
    return callback();
  };

  this.removeUser = function(user, callback) {
    users.splice(users.indexOf(user), 1);

    this.broadcastAllUser(null, function() {});
    return callback();
  };

  this.serializeUsers = function(data, callback) {
    async.map(users, function(user, callback) {
      user.getName(null, function(err, name) {
        if (err) return callback(err);
        callback(null, name);
      });
    }, callback);
  };

  this.serializeMessages = function(data, callback) {
    async.map(messages, function(message, callback) {
      message.serialize(null, function(err, serial) {
        if (err) return callback(err);
        return callback(null, serial);
      });
    }, callback);
  };

  this.serializeAll = function(data, callback) {
    var serializeMessages = function(callback) {
      return self.serializeMessages(null, callback);
    };

    var serializeUsers = function(callback) {
      return self.serializeUsers(null, callback);
    };

    var jobs = {
      serializeMessages: serializeMessages,
      serializeUsers: serializeUsers
    };
    async.parallel(jobs, function(err, results) {
      if (err) return callback(err);

      return callback(null, {
        roomName: roomName,
        messages: results.serializeMessages,
        users: results.serializeUsers
      });
    });
  };

  this.broadcastAllUser = function(data, callback) {
    this.serializeUsers(null, function(err, results) {
      if (err) return callback(err);
      async.map(users, function(user, callback) {
        self.serializeUsers(null, function(err, serial) {
          if (err) return callback(err);
          var job = {
            action: "roomUsers",
            users: serial,
            roomName: roomName
          };
          user.notify(job, callback);
        });
      }, callback);
    });
  };

  this.broadcastAllNewUser = function(user, callback) {
    user.getName(null, function(err, userName) {
      if (err) return callback(err);
      var job = {
        action: "roomNewUser",
        roomName: roomName,
        username: userName
      };

      async.map(users, function(user) {
        user.getName(null, function(err, name) {
          if (err) return callback(err);
          if (name != job.username)
            user.notify(job, callback);
        });
      }, callback);
    });
  };

  this.broadcastNewMessage = function(job, callback) {
    job.action = "roomNewMessage";
    for (var i = 0; i < users.length; i++) {
      //if (users[i].getName() != job.user)
      users[i].notify(job);
    }
    return callback();
  };

  this.load = function(data, callback) {
    roomName = data.roomName;
    
    model.getMessages({roomName: roomName}, function (err, results) {
      if (err) return console.error("ERROR: Something went wrong during retrieve messages from room :", roomName);
      results.forEach(function (message) {
        message.room = self;
        message.user = new User({});
        message.user.setName({name: message.username}, function () {});
        messages.push(new Message(message));
      });
      return callback();
    });
  };
};

module.exports = Room;
