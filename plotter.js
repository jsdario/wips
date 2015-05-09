#!/usr/bin/env node

function random (low, high) {
	return Math.random() * (high - low) + low;
}

// Requires
var express = require('express');
var socketio = require('socket.io');
var fs = require('fs');

// Configuration
var appConfig = {
	staticPath: __dirname + '/public'
}

// Application
var app = express();
var server = require('http').createServer(app);
var io = socketio.listen(server);

// Middlewares
app.use(express.static(appConfig.staticPath));

// Socket
io.sockets.on('connection', function(socket) {
	socket.emit('data', 'Welcome to plotter!');
});

module.exports = {
	web: server,
	io: io
}

