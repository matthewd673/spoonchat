var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);

var users = {};
users["system"] = "spoonmaster";
var colors = {};

app.get('/', function(req, res)
{
	res.sendFile(__dirname + "/index.html");
});

app.get('/chat', function(req, res)
{
	res.sendFile(__dirname + "/chat.html");
});

app.get('/theme.css', function(req, res)
{
	res.sendFile(__dirname + "/theme.css");
})

app.get('/rooms/:room'), function(req, res)
{
	res.send(req.params);
}

io.on('connection', function(socket)
{
	var username = "user" + Math.floor(Math.random() * 100);

	while(username in users) //to prevent discounts
		username = "user" + Math.floor(Math.random() * 100);

	users[username] = "nothing";

	console.log(username + " connected");

	io.emit("user", username);

	io.emit("chat", username + " connected", "system", id());

	socket.on('disconnect', function()
	{
		delete users[username];
		console.log('user' + username + ' disconnected');
		io.emit('chat', 'user disconnected', 'system', id());
	});

	socket.on("chat", function(msg)
	{
		if(msg != "")
		{
			uid = id();
			io.emit("chat", msg, username, uid);
			console.log(username + ': ' + msg + " (" + uid + ")");
		}
	});

	socket.on("cmd", function(cmd, value)
	{
		if(cmd == "name")
		{
			if(value.indexOf(" ") != -1)
				value = value.split(" ")[0];
			
			if(value in users)
			{
				socket.emit("chat", "That username is already taken", "system", "noid");
			}
			else
			{
				io.emit("chat", username + " has changed their name to " + value, "system", id());
			
				delete users[username];
				username = value;
				users[username] = "nothing";
			}

		}
	});

	socket.on('status', function(status)
	{
		users[username] = status;

		console.log("STATUS: " + username + " is " + status);

		if(status == "typing")
		{
			console.log(calculateTyping());
			io.emit("typestatus", calculateTyping());
		}
		if(status == "nothing")
		{
			io.emit("typestatus", calculateTyping());
			console.log(username + " active");
		}
		if(status == "inactive")
		{
			io.emit("typestatus", calculateTyping());
		}

	})

});

function id()
{
	var date = new Date().toISOString();
	var id = date.replace(/\D/g,'');
	return id;
}

function calculateTyping()
{
	var typing = 0;

	for (var user in users)
	{
		if(users[user] == "typing")
		{
			typing++;
		}
	}
	
	return typing;
}

http.listen(3000, function()
{
	console.log('listening on *:3000');
});