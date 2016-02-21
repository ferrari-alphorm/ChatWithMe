var Sequelize = require("sequelize");
var sequelize = new Sequelize('mysql://'+process.env.C9_USER+':@'+process.env.IP+':3306/c9');


var Room = sequelize.define('sequelize-rooms', {
  roomName: {type: Sequelize.STRING}
}, { freezeTableName: true });

var Message = sequelize.define('sequelize-rooms-messages', {
  username: {type: Sequelize.STRING}
  , message: {type: Sequelize.STRING}
  , date: {type: Sequelize.STRING}
}, { freezeTableName: true });

Message.belongsTo(Room);
Room.hasMany(Message, {as: "messages"});

var init = false;
var oSequelize = function () {
  var self = this;
  
  this.init = function (data, callback, origin) {
    init = true;
    Room.sync()
      .then(Message.sync())
      .then(function () {
        console.log("Sequelize: connected");
        init = true;
        origin(data, callback);
      });
  };
  
  this.getMessages = function (data, callback) {
    if (!init) return self.init(data, callback, self.getMessages);
    
    var options = { 
      include: [{model: Message, as: 'messages'}]
      , where: {roomName: data.roomName}
    };
    
    Room.findAll(options)
      .then(function (results) {
        if (results.length < 1) return callback(null, []);
        return callback(null, results[0].get("messages"));
      }, function (err) {
        return callback(err);
      });
    
  };
  
  this.saveMessage = function (data, callback) {
    // {message, username, roomName, date}
    if (!init) return self.init(data, callback, self.saveMessage);

    var options = { where: {roomName: data.roomName}};

    var message;
    var rooms;
    Message.create(data)
      .then(function (obj) { message = obj })
      .then(function () { return Room.findOrCreate(options); })
      .then(function (objs) { rooms = objs })
      .then(function () { message.update({ sequelizeRoomId: rooms[0].get('id') }) })
      .then(function () { callback(); }, callback);
  };
};

module.exports = oSequelize;