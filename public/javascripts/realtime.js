var socket = io();
var self = new function () {};

var defaultRoom = $($($(".allRooms").get(0)).children().get(0)).clone(0);

var rooms = [];
var currentRoom = null;
var username = "anonymous";

socket.on("out", function (job) {
  console.log(job.action, job);
  if (!(job.action in self)) return console.error("ERROR: action: " + job.action + " not found");
  self[job.action](job);
});

self.joinRoom = function (job) {
  var room = new Room({username: username});
  job.sendMessage = sendMessage;
  room.load(job);
  var index = rooms.push(room) - 1;
  
  if (rooms.length == 1) {
    updateDisplayRoom(index);
  }
  $('.roomList').append('<p class="roomName ' + job.roomName + '">' + job.roomName + '</h3>');
  $('.roomList').find('.' + job.roomName).click(function () {
    updateDisplayRoom(index);
  });
};

self.roomList = function (job) {
  $.each(job.rooms, function(key, value) {   
     $('#room')
         .append($("<option></option>")
         .attr("value",value.roomName)
         .text(value.roomName + " (" + value.usersNumber + ")")); 
  });
};

self.roomUsers = function (job) {
  var users = job.users;
  var room = getRoom(job.roomName);
  
  if (!room) return console.error("roomUsers: ", job.roomName, "not found");
  room.setUsers(users);
  room.updateUsersList();
};

self.roomMessages = function (job) {
  
};

self.roomNewMessage = function (job) {
  var room = getRoom(job.roomName);
  if (room == null) return ;
  room.addMessage(job);
};

self.roomNewUser = function (job) {
  var room = getRoom(job.roomName);
  if (room == null) return ;
  room.addUser(job.username);
};

$(document).ready(function () {
	socket.emit("in", [{action: "getAllRoom"}]);
	
	$('#modalPseudo').modal('show');
  
  $("#pseudoSubmit").click(function () {
    username = $("#pseudo").val();
    var rooms = ($("#room").val()) ? $("#room").val() : [];
    
    var jobs = [{action: "setName", name: username}];
    for (var i = 0; i < rooms.length; i++) {
      jobs.push({action: "joinRoom", roomName: rooms[i]});
    }
    socket.emit("in", jobs);
    $('#modalPseudo').modal('hide');
  });

  setInterval(time, 10 * 1000);  
  setHeight();
});

function time() {
  $("time").each(function(){
		$(this).text($.timeago($(this).attr('title')));
	});
};

function getRoom(roomName) {
  for (var i = 0; i < rooms.length; i++) {
    if (rooms[i].getName() == roomName) return rooms[i];
  }
  return null;
}

function updateDisplayRoom(index) {
  currentRoom = index;
  for (var i = 0; i < rooms.length; i++) {
    if (i == currentRoom) rooms[i].display();
    else rooms[i].hide();
  }
}

function sendMessage(data) {
  var message = data.message;
  var roomName = data.roomName;
  
  var jobs = [{action: "newMessage"
	  , message: message
	  , roomName: roomName
	}];
  	
  socket.emit("in", jobs);
}

function setHeight() {
	$(".slimScrollDiv").height('603');
	$(".slimScrollDiv").css('overflow', 'visible')
}