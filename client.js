#!/usr/bin/env node

var net = require('net')
, fs = require('fs')
//3rd party library to return signal strength
, program = require('commander')
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
		client.write(distFromSignal(stats[0].level.Quality));
	});
}, 1000);

client.on('data', function(data) {
	console.log('Received: ' + data);
});

client.on('close', function() {
	console.log('Connection closed');
});

client.on('end', function() {
  console.log('disconnected from server');
});



// Signal strength modeling 
//==========================
// RSSI means Receive Signal Strength Indicator
const MAX_RSSI = -35; //dBm
const MIN_RSSI = -95; //dBm
const RANGE = MAX_RSSI - MIN_RSSI;
// Received signal strength at 1 metre
const A = -35; //dBm
//path loss exponent at lossless env. is 2
const n = 2.7;

function distFromSignal(level) {
    var rssi = (level * RANGE / 100) + MIN_RSSI;
    // rssi = -10 * n * Math.log(d) + A;
    var aux = (rssi - A) / (-10 * n);
    var dist = Math.pow(10, aux);
    console.log("rssi=%s, d=%s", rssi, dist);
    return dist.toString();
}
