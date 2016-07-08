var PORT = process.env.PORT || 3000;
var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);


app.use(express.static(__dirname + '/public'));

var clientInfo = [];
var rooms = [{
				roomName: "room0",
				numPlayers: 0
			}];

var next = [0];
var lock = ["unlocked"];


function sendCurrenntUsers (socket){
    var info = clientInfo[socket.id];
    var users = [];

    if (typeof info == 'undefined'){
      return; //avoiid searching for a room if it odesn't exist
    }

    Object.keys(clientInfo).forEach(function(socketId){
        var userInfo = clientInfo[socketId];
        if(info.room == userInfo.room) {
          users.push(userInfo.name);
        }
    });

    socket.emit('chat message', {
      name: "System",
      text: "Current users: " + users.join(', '),
      time: 'insert time here'
    })
}

function checkRooms(){  //returns the name of the room that the current player joins
	if (next.length > 0){
		var length = next.length;

		for (var i = 0; i < length; i++)
		{
			if (rooms[next[0]].numPlayers < 2 ){
				var roomName = rooms[next[0]].roomName;
				rooms[next[0]].numPlayers++;

				if (rooms[next[0]].numPlayers == 2){
					next.shift();
				}
				return roomName;
				// push usernames in room into usernames 			
			}else{
				next.shift();
			} 
		}
	}
	//at the this point the next queue is empty or all rooms are full so make new room
	
	var count = rooms.length;
	rooms.push({
		roomName: "room"+count,
		numPlayers: 1		
	});

	next.push(count);
	return rooms[count].roomName;		
}

function getRoomNumber(name){
  var length = name.length;
  var number = "";
  for(var i=0; i<length; i++)
  {
      if(i>3)
      {
        number += name[i];
      }
  }
  return number;
}

io.on('connection', function(socket){
  
  
  console.log("user connected");

  
  socket.on('disconnect', function (){
      if (typeof clientInfo[socket.id] != 'undefined'){
          socket.leave(clientInfo[socket.id].room); //kicks user out of room
          io.to(clientInfo[socket.id].room).emit("chat message", {
            name: "System",
            text: clientInfo[socket.id].name + ' has left '+clientInfo[socket.id].room,
            time: 'time: 4:00pm'
          });

          var roomName = clientInfo[socket.id].room;
          var roomNumber = getRoomNumber(roomName);

          //update number of users in the room since a user has just left
          rooms[roomNumber].numPlayers--;
          next.push(roomNumber);

          // delete client data from clientInfo object
          delete clientInfo[socket.id];
      }
  });

 socket.on('joinRoom', function(req){ // req object has username but no room name attribute

 	req.room = checkRooms();

  	clientInfo[socket.id] = req;
  	socket.join(req.room);
  	socket.broadcast.to(req.room).emit('chat message', {
  		name: "system",
  		text: req.name + ' has joined this room ('+req.room+')',
  		time: 'time: ' +  Math.floor((Math.random() * 100) + 1)
  	});	
  });

  socket.on("chat message", function(msg){
  	msg.time = 'time: ' + Math.floor((Math.random() * 100) + 1);
  	console.log("message received: "+msg.text);
  	

    if (msg.text == '@currentUsers') {
        sendCurrenntUsers(socket);
    }else{
      io.to(clientInfo[socket.id].room).emit('chat message', msg);
    }
    
  });

  socket.emit("chat message", {
  	name: 'System',
  	text: 'Welcome to chat.',
  	time: '4:00am'
  })
  
});


http.listen(3000, function(){
  console.log('listening on port *:'+PORT);
});

