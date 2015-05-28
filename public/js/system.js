'use strict';

// Super monkey-patch de la repera
Array.prototype.max = function() {
  return Math.max.apply(null, this);
};
Array.prototype.min = function() {
  return Math.min.apply(null, this);
};

// ra, rb, rc: distances to the object to trilaterate
// a.x, a.y... coordinates of the nodes

const offset = {x: 3, y: 1};



var self;
function system(a, b, c, d) {
    this.dists = []; //distances array
    this.rssis = []; //received strength signal array
    this.a = a; this.b = b; this.c = c;
    //auxiliar variable
    this.points = [a, b, c, d];
    console.dir(this);
    d3.select('#' + a.tag).attr('x', 100 * (a.x + offset.x)).attr('y', 100 * (a.y + offset.y)).style('fill', a.tag);
    d3.select('#' + b.tag).attr('x', 100 * (b.x + offset.x)).attr('y', 100 * (b.y + offset.y)).style('fill', b.tag);
    d3.select('#' + c.tag).attr('x', 100 * (c.x + offset.x)).attr('y', 100 * (c.y + offset.y)).style('fill', c.tag);
    if(d !== undefined) {
        this.d = d;
        d3.select('#' + d.tag).attr('x', 100 * (d.x + offset.x))
        .attr('y', 100 * (d.y + offset.y))
        .style('fill', d.tag);
    } else {
        this.d = {ip : '', x:0, y:0, tag: 'white'}
    }
    self = this;
};


// @param [ip, link quality, link level]
system.prototype.push = function(data, cb) {
    // Assign to triangulation array
    switch(lastByte(data[0])) {
        case this.a.ip:
        this.dists[0] = data[1];
        break;
        case this.b.ip:
        this.dists[1] = data[1];
        break;
        case this.c.ip:
        this.dists[2] = data[1];
        break;
        case this.d.ip:
        this.dists[3] = data[1];
        break;
        default:
        //console.log(this.a.ip)
        break;
    };
    cb.call(this, this.handle());
};

// Handles a push and decides which nodes enter in the triangulation
system.prototype.handle = function() {
    //console.log(this.dists);
    var result, aux = []
    , a = this.a, c = this.c
    , b = this.b, d = this.d
    , r = this.dists;

    if (this.d.ip !== '') {
        if(count(this.dists) < 4)
            return null;
        // Store the 4 results to afterwards perform the avg
        aux.push(triangle(a, b, c, [r[0], r[1], r[2]]));
        aux.push(triangle(d, a, b, [r[3], r[0], r[1]]));
        aux.push(triangle(c, d, a, [r[2], r[3], r[0]]));
        aux.push(triangle(b, c, d, [r[1], r[2], r[3]]));
        result = average(aux);
    } else {
        if(count(this.dists) < 3)
            return null;
        result = triangle(a, b, c, [r[0], r[1], r[2]]);
    }
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

    // Proximity simplification
    // ========================
    // (fixes blind points)
    // since max sensitivity is 1m
    // we assume the node is right onto the point
    // so it gets shown during the average
    if (ra == 1) {
        return {x: offset.x + xa, y: offset.y + ya}
    } else if (rb == 1) {
        return {x: offset.x + xb, y: offset.y + yb}
    } else if (rc == 1) {
        return {x: offset.x + xc, y: offset.y + yc}
    }


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

// Removes the blind points
// Makes the average for a point array
function average(points) {
    var r = {x:0, y:0}; //result
    var w = []; //weights array
    var p = []; //valid points
    var v = 0; //valid points count
    points.forEach(function(point) {
        if (sanitize(point)) {
            w.push(inBounds(point));
            p.push(point);
            if(inBounds(point))
                v++;
        }
    });

    var INVALID_W = 0.05; //invalid weight

    // calculate ponderation rates (weights)
    // each invalid point is only 10%
    // unless all points are invalid
    // in which case no ponderation is performed
    // and we only calculate the array average
    var VALID_W = (1 - INVALID_W * (p.length - v)) / v;
    if(v === 0) // if no good value
        INVALID_W = 0.25; //all equally bad

    for(var i = 0; i < p.length; i++) {
        r.x += w[i] ? VALID_W * p[i].x : INVALID_W * p[i].x;
        r.y += w[i] ? VALID_W * p[i].y : INVALID_W * p[i].y;
    }
    //clear array for next round
    self.dists = [];
    self.rssis = [];
    return r;
}

// Count elements in an array different than null
function count(arr) {
    return arr.filter(function(value) { 
        return value != null 
    }).length;
}

// Returns de last byte of an ip string
function lastByte(ip) {
    var aux = ip.split('.');
    return parseInt(aux[aux.length - 1]);
}


// Returns 'false' when a point is not a candidate for 
// participating in a triangulation average
function sanitize(point) {
    if (point.x == NaN || point.x == Infinity ||  point.x == -Infinity
        ||  point.y == NaN || point.y == Infinity ||  point.y == -Infinity
        ||  !point.x || !point.y || !point)
        return false;
    else
        return true;
}

// Check if a point is in the considered area
// returns true if so, false if not.
function inBounds(p) {
    var x = [], y = [];
    self.points.forEach(function(point) {
        x.push(point.x);
        y.push(point.y);
    });

    if (p.x < offset.x + x.min() || p.y < offset.y + y.min()
    || p.x > offset.x + x.max() || p.y > offset.y + y.max()) {
        console.error('Out of bounds');
        return false;
    } else {
        return true;
    }
}

// Returns 'true' if a determined signal 
// strength is not on its sensitive edges:
// not 100% rssi -35dBm
// not 0% rssi -95dBm
function inRange(strength) {
    ;
}