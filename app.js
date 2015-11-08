require('dotenv').load();
var path = require('path');
var express = require('express');
var app = express();
var mongoose = require('mongoose');
var scourer = require('scourer');

mongoose.connect(process.env.MONGO_URL);

var Msg = mongoose.model('Msg', {
  channel: String,
  message: String,
  name: String,
  timestamp: { type : Date, default: Date.now }
});

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
		var msg = new Msg({ channel: 'General', message: data.message, name: data.name });
		io.sockets.emit('message', data);
		msg.save(function (err) {
			if (err) throw err;
		});
	});
	socket.on('disconnect', function () {
		console.log('user disconnected');
	});
  socket.on('grab', function(dat) {
    var options = {
      all: keyword,
      type: 'anigif',
      page: page
    };
    scourer.gallery.search(options, function(error, data) {
      if (error) { console.log(error); }
      else if (data.length === 0) {
        console.log('no results!');
      }
      else {
        var images = [];
        data.forEach(function(datum) {
          images.push(datum.link);
        });
        socket.emit('images', { images: images});
      }
    });
  });
});

console.log('Express server started on port %s', app.get('port'));
