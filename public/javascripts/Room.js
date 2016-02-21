var Room = function (data) {
  var self = this;
  var roomName;
  var messages = [];
  var users = [];
  var username = data.username;
  
  var element;
  
  this.setUsers = function (lUsers) {
    users = lUsers;
  };
  
  this.load = function (data) {
    var $allRooms = $($(".allRooms").get(0));
    element = $($allRooms.children().get(0)).clone(0);
    element.addClass(data.roomName);
    $allRooms.append(element);
    
    roomName = data.roomName;
    
    for (var i = 0; i < data.messages.length; i++) {
      self.addMessage(data.messages[i]);
    }
    
    users = data.users;
    this.updateUsersList();
    
    this.bindButton({sendMessage: data.sendMessage});
  };
  
  this.addMessage = function (message) {
    messages.push(message);
    var classes = ["row", "message"];
  	if (message.username == username) classes.push("self");
  	
  	var html = ['<div class="' + classes.join(" ") + '">'
  	, '  <p class="infos">'
  	, '    <span class="pseudo">' + message.username + '</span>, '
  	, '    <time class="date" title="'+message.date+'">'+message.date+'</time>'
  	, '  </p>'
  	, '  <p>' + message.message + '</p>'
  	, '</div>'];
  	
  	element.find(".messages").append(html.join(""));
  	time();
  };
  
  this.addUser = function (user) {
    users.push(user);
    this.updateUsersList();
  };
  this.removeUser = function (user) { 
    users.splice(users.indexOf(user), 1);
    this.updateUsersList();
  };
  
  this.updateUsersList = function () {
    var $userList =  $($("." + roomName + " .userList").get(0));
    $userList.html("");
    for (var i = 0; i < users.length; i++) {
      $userList.append('<p class="user">' + users[i] + '</p>');  
    }
  };

  this.getName = function () {
    return roomName;
  };
  
  this.display = function () {
    element.removeClass("hidden");
  };
  
  this.hide = function () {
    element.addClass("hidden");
  };
  
  this.bindButton = function (functions) {
    element.find("#submit").click(function () {
      var data = {
        message: element.find('#messageInput').val()
        , roomName: roomName
      };
      functions.sendMessage(data);
  	});
  };
};