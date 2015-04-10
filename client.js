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
var timer = setInterval(function () {
	procfs.wifi(function (err, stats, buffer) {
		console.log("%s   %s", 
			stats[0].link.Quality,
			stats[0].level.Quality);
	
		client.write(stats[0].link.Quality + 
			stats[0].level.Quality);
	});
}, 2000);


client.on('data', function(data) {
	console.log('Received: ' + data);
});

client.on('close', function() {
	console.log('Connection closed');
});