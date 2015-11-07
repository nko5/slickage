var path = require('path');
var express = require('express');
var app = express();

app.set('port', process.env.PORT || 8080);
app.use(express.static(path.join(__dirname, '/public')));
app.get('*', function (req, res) {
	res.sendFile('index.html', {root: __dirname + '/public'});
});

var io = require('socket.io').listen(app.listen(app.get('port')));

io.sockets.on('connection', function (socket) {
	console.log('A user connected');
	socket.emit('message', {message: 'Welcome to the chat room!'});
	socket.on('send', function (data) {
		console.log(data);
		io.sockets.emit('message', data);
	});
	socket.on('disconnect', function () {
		console.log('user disconnected');
	});
});

console.log('Express server started on port %s', app.get('port'));
