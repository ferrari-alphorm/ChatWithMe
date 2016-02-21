var async = require("async");
var mongoose = require('mongoose');
var findOrCreate = require('mongoose-findorcreate');

var Schema = mongoose.Schema;
mongoose.plugin(findOrCreate);

var roomSchema = Schema({
  roomName: String
  , messages: [{type: Schema.Types.ObjectId, ref: 'Message'}]
});

var messageSchema = Schema({
  _creator: {type: Schema.Types.ObjectId, ref: 'Room'}
  , username: String
  , message: String
  , data: String
});

var Room = mongoose.model('Room', roomSchema);
var Message = mongoose.model('Message', messageSchema);

var init = false;
var MongoDB = function () {
  var self = this;
  
  this.init = function (data, callback, origin) {
    init = true;
    mongoose.connect('mongodb://localhost/test');
    var db = mongoose.connection;
    db.on('error', console.error.bind(console, 'connection error:'));
    db.once('open', function () {
      console.log("Mongodb connected");
      origin(data, callback);
    });
  };
  
  this.getMessages = function (data, callback) {
    if (!init) return self.init(data, callback, self.getMessages);
  
    Room
      .find({roomName: data.roomName})
      .populate('messages')
      .exec(function (err, rooms) {
        if (err) return callback(err);
        if (!(rooms instanceof Array) || (rooms.length < 1)) return callback(null, []);
        return callback(null, rooms[0].messages);
      });
  };
  
  this.saveMessage = function (data, callback) {
    // {message, username, roomName, date}
    if (!init) return self.init(data, callback, self.saveMessage);
  
    var message;
    var createMessage = function (callback) {
      message = new Message(data);
      message.save(function (err) { return callback(err); });
    };
    
    var findOrCreateRoom = function (callback) {
      Room.findOrCreate({roomName: data.roomName}, function (err, room) {
        if (err) return callback(err);
        return callback(null, room);
      });
    };
    
    var associate = function (room, callback) {
      room.messages.push(message);
      room.save(callback);
    };
    
    var jobs = [createMessage, findOrCreateRoom, associate];
    async.waterfall(jobs, callback);
  };
};

module.exports = MongoDB;