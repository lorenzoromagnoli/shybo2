var robot;
var fftData = new Array(256);

window.onload = function() {
	console.log('Setting up socket connections:');
	// Once we have a list of available robots we can use
	// any of them and connect to their socket.

	url = window.location.href;
	splitted = url.split(':');
	wsUrl = splitted[0] + ':' + splitted[1] + ':3001';
	console.log(wsUrl);

	robot = io(wsUrl + '/api/robots/Shybo');
	robot.emit('commands');
	robot.emit('events');
	robot.on('message', function(payload) {

		if (payload.name == 'fft') {
			if (payload.data) {
				fftData = payload.data;
				//drawchart();
			}
		}else if (payload.name == 'color_changed') {
			if (payload.data) {
				colorviewer=$('.colorSensor .colorviewer');
				colorviewer.css("background-color", "rgb("+payload.data.red+','+payload.data.green+','+payload.data.blue+')')
			}
			logEvent(payload);
		}else {

		}
	});
	msg = 'You have been subscribed to Cylon sockets:' + robot.nsp;
	$('#messages').append($('<li>').text(msg));
};

function getColorSensor() {
	robot.emit('getColorSensor');
}


function setup() {
	var canvas = createCanvas(window.innerWidth, 100);
	canvas.parent('viz');
	//background(255,0,2);
}

function draw() {
	drawchart();
}

function logEvent(payload){
	console.log('On Robot');
	console.log('  Name:', payload.name);
	console.log('  Type:', payload.type);
	console.log('  Data:', payload.data);
	$('#messages').prepend($('<li>').text('On Robot:'));
	$('#messages').prepend($('<li>').text('event:' + payload.name.toString()));
	if (!!payload.data) {
		$('#messages').prepend($('<li>').text('data:' + payload.data.toString()));
	}
	$('#messages').prepend($('<hr />'));
}

function drawchart() {
	background(255);
	var barwidth = width / 256 * 2;
	fill(0);
	stroke(150);
	for (var i = 0; i < 256; i++) {
		line(i * barwidth, height + fftData[i] * 500, i * barwidth, height);
	}
}
