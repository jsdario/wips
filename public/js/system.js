'use strict';

// ra, rb, rc: distances to the object to trilaterate
// a.x, a.y... coordinates of the nodes

const offset = {x: 3, y: 1};
var dists; //global


var self;
function system(a, b, c, d) {
    dists = []; //distances array
    this.a = a; this.b = b; this.c = c; this.d = d;
    //auxiliar variable
    this.points = [a, b, c, d];
    console.dir(this);
    d3.select('#a').attr('x', 100 * (a.x + offset.x)).attr('y', 100 * (a.y + offset.y)).style('fill', a.tag);
    d3.select('#b').attr('x', 100 * (b.x + offset.x)).attr('y', 100 * (b.y + offset.y)).style('fill', b.tag);
    d3.select('#c').attr('x', 100 * (c.x + offset.x)).attr('y', 100 * (c.y + offset.y)).style('fill', c.tag);
    d3.select('#d').attr('x', 100 * (d.x + offset.x)).attr('y', 100 * (d.y + offset.y)).style('fill', d.tag);
    self = this;
};


// @param [ip, link quality, link level]
system.prototype.push = function(data, cb) {
    // Assign to triangulation array
    switch(lastByte(data[0])) {
        case this.a.ip:
        dists[0] = data[1];
        break;
        case this.b.ip:
        dists[1] = data[1];
        break;
        case this.c.ip:
        dists[2] = data[1];
        break;
        case this.d.ip:
        dists[3] = data[1];
        break;
        default:
        console.log(this.a.ip)
        break;
    };
    cb.call(this, this.handle());
};

// Handles a push and decides which nodes enter in the triangulation
system.prototype.handle = function() {
    console.log(dists);
    if(count(dists) < 3)
        return null;

    var result, aux = []
    , a = this.a, c = this.c
    , b = this.b, d = this.d
    , r = dists;

    // Store the 4 results to afterwards perform the avg
    // aux.push(triangle(a, b, c, [r[0], r[1], r[2]]));
    // aux.push(triangle(d, a, b, [r[3], r[0], r[1]]));
    // aux.push(triangle(c, d, a, [r[2], r[3], r[0]]));
    // aux.push(triangle(b, c, d, [r[1], r[2], r[3]]));
    // result = average(aux);

    result = triangle(a, b, c, [r[0], r[1], r[2]]);
    console.log(result);
    return result;
}


// @arguments [A coords, B coords, C coords, d[] distances array]
// @return position as {x: 1.00, y: 4.5}
function triangle(a, b, c, d) {

    const xa = a['x'], ya = a['y']
    , xb = b['x'], yb = b['y']
    , xc = c['x'], yc = c['y']
    , ra = d[0], rb = d[1]
    , rc = d[2];

    var S = (Math.pow(xc, 2.) - Math.pow(xb, 2.) + Math.pow(yc, 2.) - Math.pow(yb, 2.) + Math.pow(rb, 2.) - Math.pow(rc, 2.)) / 2.0;
    var T = (Math.pow(xa, 2.) - Math.pow(xb, 2.) + Math.pow(ya, 2.) - Math.pow(yb, 2.) + Math.pow(rb, 2.) - Math.pow(ra, 2.)) / 2.0;
    var y = ((T * (xb - xc)) - (S * (xb - xa))) / (((ya - yb) * (xb - xc)) - ((yc - yb) * (xb - xa)));
    var x = ((y * (ya - yb)) - T) / (xb - xa);
    console.log("(%s, %s)", x, y);
    return {
        x: offset.x + x,
        y: offset.y + y
    };
};


// Helpers
// =======

const INVALID_W = 0.1; //invalid weight

// Removes the blind points
// Makes the average for a point array
function average(points) {
    var r = {x:0, y:0}; //result
    var w = []; //weights array
    var p = []; //valid points
    var v = 0; //valid points count
    points.forEach(function(point) {
        if (sanitize(point)) {
            weights.push(inBounds(point));
            p.push(point);
            if(inBounds(point))
                v++;
        }
    });
    // calculate ponderation rates (weights)
    // each invalid point is only 10%
    // unless all points are invalid
    // in which case no ponderation is performed
    // and we only calculate the array average
    var VALID_W = (1 - INVALID_W * (p.length - v)) / v;

    for(var i = 0; i < p.length; i++) {
        r.x += w[i] ? VALID_W * p[i].x : INVALID_W * p[i].x;
        r.y += w[i] ? VALID_W * p[i].y : INVALID_W * p[i].y;
    }

    //console.log(p);
    dists = [];
    return r;
}

// Count elements in array
function count(arr) {
    return arr.filter(function(value) { 
        return value != null 
    }).length;
}

function lastByte(ip) {
    var aux = ip.split('.');
    return parseInt(aux[aux.length - 1]);
}

function sanitize(point) {
    if (point.x == NaN || point.x == Infinity ||  point.x == -Infinity
        ||  point.y == NaN || point.y == Infinity ||  point.y == -Infinity
        ||  !point.x || !point.y || !point)
        return false;
    else
        return true;
}

// Check if a point is in the considered area
function inBounds(p) {
    var x = [], y = [];
    self.points.forEach(function(point) {
        x.push(point.x);
        y.push(point.y);
    });

    if (p.x < offset.x    || p.y < offset.y || p.x > Math.max(x) || p.y > Math.max(y)) {
        console.error('[%s, %s] out of bounds', p.x, p.y);
        return false;
    } else {
        return true;
    }
}

