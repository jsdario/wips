
var net = require('net');

var program = require('commander');

program
.version('0.0.1')
.option('-A, --fade <n>', 'Path dissipation at 1 meter',  parseFloat)
.option('-n, --path-loss <n>', 'Path loss exponent',  parseFloat)
.parse(process.argv);

var server = net.createServer(function (socket) {
socket.write('Welcome. Sincerly, your server.\r\n');
socket.on('data', function(data) {
var aux = data.toString().split('.');
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
const A = program.fade || -35; //dBm
//path loss exponent at lossless env. is 2
const n = program.pathLoss || 2.7;
var rssi = (signal.level * RANGE / 100) + MIN_RSSI;
// rssi = -10 * n * Math.log(d) + A;
var aux = (rssi - A) / (-10 * n);
var dist = Math.pow(10, aux);
console.log('rssi=%s', rssi);
console.log('distance=%s', dist);
console.log('A=%s', A);
console.log('n=%s', n);
}

