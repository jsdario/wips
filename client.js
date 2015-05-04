var net = require('net');

var timer, counter = 0;

var client = new net.Socket();
client.connect(31416, '127.0.0.1', function() {
	console.log('Connected');
	// listen signal strength changes
	// and client.write( <new signal strength> );
});

client.on('data', function(data) {
	console.log('Received: ' + data);
	counter++;
	console.log('Counter=%s', counter);
	if (counter > 6) {
		// kill client after server's response
		clearInterval(timer);
		client.destroy();
	}
});

client.on('close', function() {
	console.log('Connection closed');
});