

var Message = function (data) {
  var message = data.message;
  var user = data.user;
  var room = data.room;
  var date = data.date;
  
  this.getMessage = function (data, callback) {
    return callback(null, message);
  };
  
  this.getUser = function (data, callback) {
    return callback(null, user);
  };
  
  this.getRoom = function (data, callback) {
    return callback(null, room);
  };
  
  this.serialize = function (data, callback) {
    user.getName(null, function (err, username) {
      if (err) return callback(err);
      return callback(null, {username: username, message: message, date: date});
    });
  };
};

module.exports = Message;