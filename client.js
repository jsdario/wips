#!/usr/bin/env node

var net = require('net')
, fs = require('fs')
//3rd party library to return signal strength
, program = require('commander');
, procfs = require('procfs-stats');

program
.version('0.0.1')
.option('-b, --ip <n>', 'Bind to base station IP')
.parse(process.argv);

var ip = program.ip || '127.0.0.1';

var client = new net.Socket();
client.connect(31416, ip, function() {
	console.log('Connected');
});

// listen signal strength changes
// and client.write( <new signal strength> );
var timer = setInterval(function () {
	procfs.wifi(function (err, stats, buffer) {
		console.log("%s %s", 
			stats[0].link.Quality,
			stats[0].level.Quality);

		client.write(stats[0].link.Quality 
			+ stats[0].level.Quality);
	});
}, 2000);

client.on('data', function(data) {
	console.log('Received: ' + data);
});

client.on('close', function() {
	console.log('Connection closed');
});

client.on('end', function() {
  console.log('disconnected from server');
});
