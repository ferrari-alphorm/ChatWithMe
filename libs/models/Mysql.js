var async      = require('async');
var mysql      = require('mysql');
var connection = mysql.createConnection({
  host     : process.env.IP,
  user     : process.env.C9_USER,
  password : '',
  database : 'c9'
});

connection.config.queryFormat = function (query, values) {
  if (!values) return query;
  return query.replace(/\:(\w+)/g, function (txt, key) {
    if (values.hasOwnProperty(key)) {
      return this.escape(values[key]);
    }
    console.log("Query:", txt);
    return txt;
  }.bind(this));
};

var init = false;
var Mysql = function () {
  var self = this;
  
  this.init = function (data, callback, origin) {
    connection.connect(function(err) {
      if (err) return console.error('error connecting: ' + err.stack);
      console.log('Mysql: connected as id ' + connection.threadId);
      init = true;
      origin(data, callback);
    });
  };
  
  this.getMessages = function (data, callback) {
    if (!init) return self.init(data, callback, self.getMessages);

    var sql = ["SELECT `username`, `message`, `date`"
              , "FROM rooms"
              , "LEFT JOIN `rooms-messages`"
              , "  ON `rooms`.`id` = `rooms-messages`.`this_id`"
              , "WHERE `roomName` = :roomName"].join(" ");
    connection.query(sql, data, callback);
  };
  
  this.saveMessage = function (data, callback) {
    // {message, username, roomName, date}
    if (!init) return self.init(data, callback, self.saveMessage);

    
    var getRoomId = function (callback) {
      var sql = ["INSERT INTO `rooms` (`roomName`)"
                , "VALUES (:roomName)"
                , "ON DUPLICATE KEY UPDATE `id` = LAST_INSERT_ID(`id`)"].join(" ");
      
      connection.query(sql, data, function (err, rows) {
        if (err) return callback(err);
        data.roomId = rows.insertId;
        return callback(null, data);
      });
    };
    
    var insert = function (data, callback) {
      var sql = ["INSERT INTO `rooms-messages`"
                , "(`this_id`, `username`, `message`, `date`)"
                , "VALUES (:roomId, :username, :message, :date)"].join(" ");
    
      connection.query(sql, data, callback);
    };
    
    var jobs = [getRoomId, insert];
    async.waterfall(jobs, callback);
  };
};

module.exports = Mysql;