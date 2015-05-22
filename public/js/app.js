var sys = new system(
	{x: 5.2, y: 1.05},
	{x: 4.8, y: 4.7},
	{x: 1, y: 1},
	{x: 0.3, y: 5.2}
	);

var socket = io.connect();
socket.on('data', function (data) {
	sys.push(data.split(','), function (coords) {

		d3.select("svg").append("circle")
		.attr("r", 5).attr("cx", 100 * coords.x)
		.attr("cy", 100 * coords.y).transition()
		.style("opacity", 0.05);

		d3.select("#cell").attr("cx", 100 * coords.x)
		.attr("cy", 100 * coords.y);
	});
});