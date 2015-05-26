var sys = new system(
	{ip: 182, tag: 'red', x: 4.2, y: 0.05},
	{ip: 30, tag: 'yellow', x: 3.3, y: 3.5},
	{ip: 71, tag: 'blue', x: 0, y: 3.2},
	{ip: 233, tag: 'grey', x: 0, y: 0}
	);

var socket = io.connect();
socket.on('data', function (data) {
	sys.push(data.split(','), function (coords) {
		if(coords === null)
			return;
		d3.select("svg").append("circle")
		.attr("r", 5).attr("cx", 100 * coords.x)
		.attr("cy", 100 * coords.y).transition()
		.style("opacity", 0.05);
		d3.select("#cell").attr("cx", 100 * coords.x)
		.attr("cy", 100 * coords.y);
	});
});