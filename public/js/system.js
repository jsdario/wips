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

// ra, rb, rc: distances to the object to trilaterate
// a.x, a.y... coordinates of the nodes

function system(a, b, c) {
    console.info("New trilateration scenario");
    console.dir(a); console.dir(b); console.dir(c);
    this.a = a;
    this.b = b;
    this.c = c;
    this.d = [];
};

// @param [ip, link quality, link level]
system.prototype.push = function(data, cb) {
    // Assign to triangulation array
    switch(data[0]) {
        case '192.168.1.71':
        this.d[0] = distFromSignal(data[2]);
        break;
        case '::ffff:192.168.1.71':
        this.d[0] = distFromSignal(data[2]);
        break;
        case '192.168.1.233':
        this.d[1] = distFromSignal(data[2]);
        break;
        case '::ffff:192.168.1.233':
        this.d[1] = distFromSignal(data[2]);
        break;
        case '192.168.1.121':
        this.d[2] = distFromSignal(data[2]);
        break;
        case '::ffff:192.168.1.121':
        this.d[2] = distFromSignal(data[2]);
        break;
    };
    cb.call(this, this.triangle())
};

// @arguments [A radius, B radius, C radius]
// @return position as {x: 1.00, y: 4.5}
system.prototype.triangle = function() {
    if(this.d.length < 3)
        return {x: 0, y: 0}; //min 3 distances

    const xa = this.a['x'], ya = this.a['y']
    , xb = this.b['x'], yb = this.b['y']
    , xc = this.c['x'], yc = this.c['y']
    , ra = this.d[0], rb = this.d[1]
    , rc = this.d[2];

    var S = (Math.pow(xc, 2.) - Math.pow(xb, 2.) + Math.pow(yc, 2.) - Math.pow(yb, 2.) + Math.pow(rb, 2.) - Math.pow(rc, 2.)) / 2.0;
    var T = (Math.pow(xa, 2.) - Math.pow(xb, 2.) + Math.pow(ya, 2.) - Math.pow(yb, 2.) + Math.pow(rb, 2.) - Math.pow(ra, 2.)) / 2.0;
    var y = ((T * (xb - xc)) - (S * (xb - xa))) / (((ya - yb) * (xb - xc)) - ((yc - yb) * (xb - xa)));
    var x = ((y * (ya - yb)) - T) / (xb - xa);

    console.log("(%s,%s)", x, y);

    return {
        x: x,
        y: y
    };
};


// Helper
//=======
// returns distance in meters
function distFromSignal(level) {
    var rssi = (level * RANGE / 100) + MIN_RSSI;
    // rssi = -10 * n * Math.log(d) + A;
    var aux = (rssi - A) / (-10 * n);
    var dist = Math.pow(10, aux);
    console.log('  r=%s -> d=%s', rssi, dist);
    return dist;
}