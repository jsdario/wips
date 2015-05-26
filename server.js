#!/usr/bin/env node

var net = require('net')
, log = require('loglevel')
, plotter = require('./plotter')
, program = require('commander')

// Cmd line configuration
//=======================
program.version('1.0.0')
.option('-d, --debug', 'Enable debug logs')
.option('-t, --tcp <n>', 'port for the TCP server', 31416, parseInt)
.option('-p, --http <n>', 'port for the HTTP server', 8000, parseInt)
.parse(process.argv);

if(program.debug) {
	log.setLevel('debug');
} else {
	log.setLevel('info');
}

//distances array
var dists = []; 

var server = net.createServer(function (socket) {
	socket.write('Welcome. Sincerly, your server.\r\n');
	socket.on('data', function(data) {
		log.debug('=============================');
		log.debug('[tcp://%s] d=%s', socket.remoteAddress, data);
		var pkt = [socket.remoteAddress, data];
		plotter.io.emit('data', pkt.join(','));
	});
});

server.listen(program.tcp, function () {
	log.info('Base Station listening at http://%s:%s',
		server.address().address,
		server.address().port);
});

plotter.web.listen(program.http, function () {
	log.info('Plotter listening at http://%s:%s',
		plotter.web.address().address,
		plotter.web.address().port);
});
