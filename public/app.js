var socket = io();

var names = ["name0","name1","name2","name3","name4","name5","name6","name7","name8","name9","name10","name11","name12","name13","name14","name15"];
var random = Math.floor((Math.random() * 15) + 1);
var name = names[random];

var rooms = ["room0","room1","room2"];
var random2 = Math.floor((Math.random() * 2) + 1);
var room = rooms[random2];

//$("#room").html("Room: "+room);
$("#name").html("Name: "+name);


$('form').submit(function(){
	socket.emit('chat message', {
		name: name,
		text: $('#m').val()
	});
	$('#m').val('');
	return false;
});


socket.on('connect', function(){
	socket.emit('joinRoom', {
		name:name
		//room: room
	} );
});

		
socket.on('chat message', function(msg){
	$('#messages').append("<li>"+msg.time+":<br>"+msg.name+": "+msg.text+"</li>");
});


