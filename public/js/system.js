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

function system(a, b, c, extra) {
    console.info("New trilateration scenario");
    console.dir(a); console.dir(b); console.dir(c);
    this.a = a;
    this.b = b;
    this.c = c;
    this.extra = extra;
    this.d = []; //distances array

    d3.select("#a").attr("cx", 100 * a.x).attr("cy", 100 * a.y);
    d3.select("#b").attr("cx", 100 * b.x).attr("cy", 100 * b.y);
    d3.select("#c").attr("cx", 100 * c.x).attr("cy", 100 * c.y);
    d3.select("#d").attr("cx", 100 * extra.x).attr("cy", 100 * extra.y);
};


// @param [ip, link quality, link level]
system.prototype.push = function(data, cb) {
    // Assign to triangulation array
    switch(data[0]) {
        case '::ffff:192.168.1.182':
        this.d[0] = distFromSignal(data[2]);
        break;
        case '::ffff:192.168.1.30':
        this.d[1] = distFromSignal(data[2]);
        break;
        case '::ffff:192.168.1.12':
        this.d[2] = distFromSignal(data[2]);
        break;
        case '::ffff:192.168.1.121':
        this.d[3] = distFromSignal(data[2]);
        break;
    };
    cb.call(this, this.handle());
};

// Handles a push and decides which nodes enter in the triangulation
system.prototype.handle = function() {
    var aux = [], x, y;
    var a = this.a, b = this.b, c = this.c, e = this.extra
    , d = this.d;

    aux.push(triangle(a, b, c, [d[0], d[1], d[2]]));
    aux.push(triangle(e, a, b, [d[3], d[0], d[1]]));
    aux.push(triangle(c, e, a, [d[2], d[3], d[0]]));
    aux.push(triangle(b, c, e, [d[1], d[2], d[3]]));

    return average(aux);
    //return triangle(a, b, c, [d[0], d[1], d[2]]);
}


// @arguments [A coords, B coords, C coords, d[] distances array]
// @return position as {x: 1.00, y: 4.5}
function triangle(a, b, c, d) {
    if(d[0] === -1 || d[1] === -1 || d[2] === -1) {
        console.error("Blind point");
        return null;
    }

    const xa = a['x'], ya = a['y']
    , xb = b['x'], yb = b['y']
    , xc = c['x'], yc = c['y']
    , ra = d[0], rb = d[1]
    , rc = d[2];

    var S = (Math.pow(xc, 2.) - Math.pow(xb, 2.) + Math.pow(yc, 2.) - Math.pow(yb, 2.) + Math.pow(rb, 2.) - Math.pow(rc, 2.)) / 2.0;
    var T = (Math.pow(xa, 2.) - Math.pow(xb, 2.) + Math.pow(ya, 2.) - Math.pow(yb, 2.) + Math.pow(rb, 2.) - Math.pow(ra, 2.)) / 2.0;
    var y = ((T * (xb - xc)) - (S * (xb - xa))) / (((ya - yb) * (xb - xc)) - ((yc - yb) * (xb - xa)));
    var x = ((y * (ya - yb)) - T) / (xb - xa);
    //console.log("(%s, %s)", x, y);
    return {
        x: x,
        y: y
    };
};

// Helpers
//========
// returns distance in meters. 
// If level = 100% or < 3% returns -1
function distFromSignal(level) {
    var rssi = (level * RANGE / 100) + MIN_RSSI;
    // rssi = -10 * n * Math.log(d) + A;
    var aux = (rssi - A) / (-10 * n);
    var dist = Math.pow(10, aux);
    console.log("rssi=%s, d=%s", rssi, dist);
    return dist;
}


// Removes the blind points
// and makes the average for a point array
function average(points) {
    var p = {x:0, y: 0};
    var length = 0;
    points.forEach(function(point) {
        if (point !== null) {
            length ++;
            p.x = point.x;
            p.y = point.y;
        }
    });
    //console.log("length=%s", length);
    p.x = p.x / length;
    p.y = p.y / length;
    //console.log(p);
    return p;
}