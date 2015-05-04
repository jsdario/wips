var net = require('net')
, fs = require('fs')
//3rd party library to return signal strength
, procfs = require('procfs-stats');

var client = new net.Socket();
client.connect(31416, '127.0.0.1', function() {
	console.log('Connected');
});

// listen signal strength changes
// and client.write( <new signal strength> );
fs.watch('/proc/net/wireless', function (event) {
	console.log('event is: ');
	console.dir(event);
	procfs.wifi(function (stats) {
		console.log(stats);
		//client.write(stats[1].level);
	});
});


client.on('data', function(data) {
	console.log('Received: ' + data);
});

client.on('close', function() {
	console.log('Connection closed');
});