var Mysql = require("./models/Mysql.js");
var Sequelize = require("./models/Sequelize.js");
var MongoDB = require("./models/MongoDB.js");
/*
init 
saveMessage {message, username, roomName, date }, retour ?
getMessage {roomName} return [{message, username, roomName, date }, ...]
*/

var ModelsManager = function () {
  var _abs;
  
  this.init = function (data) {
    var model = data.model;
    
    switch (model) {
      case "mysql":
        _abs = new Mysql();
        break;
      case "sequelize":
        _abs = new Sequelize();
        break;
      case "mongodb":
        _abs = new MongoDB();
        break;
    }
    
    var mandatoryFunctions = ["init", "getMessages", "saveMessage"];
    for (var i = 0; i < mandatoryFunctions.length; i++) {
      if (!(mandatoryFunctions[i] in _abs)) {
        console.error("Un fonction obligatoire (", mandatoryFunctions[i], ") manque dans le model :", model);
        process.exit();
      }
    }
    
    return _abs;
  };
  
};

module.exports = new ModelsManager();