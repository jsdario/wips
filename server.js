var net = require('net');

var server = net.createServer(function (socket) {
	socket.write('Welcome. Sincerly, your server.\r\n');
	socket.on('data', function(data) {
		var aux = data.split('.');
		console.log('Received: ' + data);
		// In percentage format
		distFromSignal({
			quality: aux[0],
			level: aux[1]
		});
	});
});


server.listen(31416, '127.0.0.1');

function distFromSignal(signal) {
	// RSSI means Receive Signal Strength Indicator
	const MAX_RSSI = -35; //dBm
	const MIN_RSSI = -95; //dBm
	const RANGE = MAX_RSSI - MIN_RSSI;
	// Received signal strength at 1 metre
	const A = -35; //dBm
	const n = 2.7; //path loss exponent at lossless
				   //environment
	var rssi = (signal.level * RANGE / 100) - MIN_RSSI;
	// rssi = -10 * n * Math.log(d) + A;
	var aux = (rssi - A) / (-10 * n);
	var dist = Math.exp(aux);
}