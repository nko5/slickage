var socket = io();

var chatMessages = [];
var username = m.prop("");
var message = m.prop("");
var shownImage = m.prop("http://i.imgur.com/tr8ZKod.gif");

var chat = {
	controller: function() {
		(function () {
			m.startComputation();
			socket.on('message', function (data) {
				try { if (data.message) { chatMessages.push(data); } }
        catch (e) { alert('There is a problem:', e); }
        finally { m.endComputation(); }
			});
		})();
	},
	vm: { init: function() {} },
	view: function (ctrl) {
		return m("section",
			[m("div.conversation",
	      [
					chatMessages.map(function (msg, i) {
						return m('div',
							m('b', (msg.name ? msg.name : 'Server' ) + ': '),
							m('span', msg.message)
	          );
					})
	      ])
	    ]
		);
	}
};

var chatInput = {
	controller: function() {},
	vm: {
		init: function() {},
		send: function () {
			if (!username()) { alert('Please type your name!'); }
      else if (message()) {
				var payload = { message: message(), name: username() };
				socket.emit('send', payload);
        socket.emit('grab');
				message(""); // reset msg input
			}
		}
	},
	view: function (ctrl) {
		return m("section", [
			m("div", "Username: "),
			m("input.chat", {onchange: m.withAttr("value", username), value: username()}),
			m("br"), m("br"),
			m("textarea.chat", {onchange: m.withAttr("value", message), value: message()}),
			m("button", {onclick: chatInput.vm.send}, "Send")
		]);
	}
};
var imgq = [];
var imageView = {
  controller: function() {
    socket.on('images', function(data) {
      try {
        if (data.images) {
          imgq = data.images;
        }
      }
      catch (e) { alert('There is an image problem:', e); }
      finally { m.endComputation(); }
    });
  },
  view: function (ctrl) {
    return m('img', {src: shownImage() });
  }
};

m.module(document.getElementById('chatDisplay'), chat);
m.module(document.getElementById('chatInput'), chatInput);
m.module(document.getElementById('imageView'), imageView);

setInterval(function() {
  console.log('refreshing image');
  // repopulate with new data
  if (imgq.length < 1) {
    socket.emit('grab');
  }
  if (imgq.length > 0) {
    shownImage = m.prop(imgq.shift());
    m.render(document.getElementById('imageView'), imageView);
  }
}, 4000 /* you never need to watch more than 4 seconds of any gif, ever. */);
