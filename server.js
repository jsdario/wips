var net = require('net');

var server = net.createServer(function (socket) {
	socket.write('Welcome. Sincerly, your server.\r\n');
	socket.on('data', function(data) {
		console.log('Received: ' + data);
		socket.write('Roger that\r\n');
	});
});


server.listen(31416, '127.0.0.1');