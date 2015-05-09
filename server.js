#!/usr/bin/env node

var net = require('net')
, log = require('loglevel')
, plotter = require('./plotter')
, program = require('commander')

// Cmd line configuration
//=======================
program.version('1.0.0')
.option('-d, --debug', 'Enable debug logs')
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
		var aux = data.toString().split('.');
		log.debug('=============================');
		log.debug('# %s from tcp://%s', data,
			socket.remoteAddress);
		var pkt = [socket.remoteAddress, aux[0], aux[1]];
		plotter.io.emit('data', pkt.join(','));
	});
});

server.listen(31416, function () {
	log.info('Base Station listening at http://%s:%s',
		server.address().address,
		server.address().port);
});

plotter.web.listen(3000, function () {
	log.info('Plotter listening at http://%s:%s',
		plotter.web.address().address,
		plotter.web.address().port);
});
