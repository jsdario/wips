var sys = new system(
	{x: 4.5, y: 0},
	{x: 1, y: 5},
	{x: 0, y: 0}
	);

var socket = io.connect();
socket.on('data', function (data) {
	sys.push(data.split(','), function (coords) {

		d3.select("svg").append("circle")
		.attr("r", 5).attr("cx", 100 * coords.x)
		.attr("cy", 100 * coords.y).transition()
		.style("opacity", 0.5);

		d3.select("#cell").attr("cx", 100 * coords.x)
		.attr("cy", 100 * coords.y);
	});
});