'use strict';

var _sys_, sysa, sysb, sysc, sysd;

var red = {ip: 182, tag: 'red', x: 4.2, y: 0.05},
yellow = {ip: 121, tag: 'yellow', x: 3.3, y: 3.5},
blue = {ip: 162, tag: 'blue', x: -0.33, y: 3.2},
grey = {ip: 233, tag: 'grey', x: 0, y: 0};

var coordinates;

sysa = new system(red, yellow, blue);
sysb = new system(grey, red, yellow);
sysc = new system(blue, grey, red);
sysd = new system(yellow, blue, grey);
_sys_ = new system(red, yellow, blue, grey);


var socket = io.connect();
var turtle = io.connect('http://192.168.1.35:31416');
socket.on('data', function (data) {

	_sys_.push(data.split(','), function (coords) {
		if(coords === null)
			return;

		coordinates = coords;

		d3.select("svg").append("circle")
		.attr("r", 5).attr("cx", 100 * coords.x)
		.attr("cy", 100 * coords.y).transition()
		.style("opacity", 0.05);
		d3.select("#cell").attr("cx", 100 * coords.x)
		.attr("cy", 100 * coords.y);
	});


	sysa.push(data.split(','), function (coords) {
		if(coords === null)
			return;
		d3.select("#cella").attr("cx", 100 * coords.x)
		.attr("cy", 100 * coords.y).style('fill', 'steelblue');
	});

	sysb.push(data.split(','), function (coords) {
		if(coords === null)
			return;
		d3.select("#cellb").attr("cx", 100 * coords.x)
		.attr("cy", 100 * coords.y).style('fill', 'orange');
	});

	sysc.push(data.split(','), function (coords) {
		if(coords === null)
			return;
		d3.select("#cellc").attr("cx", 100 * coords.x)
		.attr("cy", 100 * coords.y).style('fill', 'green');
	});

	sysd.push(data.split(','), function (coords) {
		if(coords === null)
			return;
		d3.select("#celld").attr("cx", 100 * coords.x)
		.attr("cy", 100 * coords.y).style('fill', 'purple');
	});
});

setInterval(function() {
	turtle.emit('move', coordinates);
}, 30 * 1000);