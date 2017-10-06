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
		} else if (payload.name == 'color_changed') {
			if (payload.data) {
				colorviewer = $('.colorSensor .colorviewer');
				colorviewer.css("background-color", "rgb(" + payload.data.red + ',' + payload.data.green + ',' + payload.data.blue + ')')
			}
			logEvent(payload);
		} else if (payload.name == 'mode_changed') {
			if (payload.data == "teach_color") {
				$('input:radio[name=mode]')[0].checked = true;

			} else if (payload.data == "teach_sound") {
				$('input:radio[name=mode]')[1].checked = true;
			} else if (payload.data == "play") {
				$('input:radio[name=mode]')[2].checked = true;
			}
			// $('.mode .colorviewer');


		} else {

		}
	});
	msg = 'You have been subscribed to Cylon sockets:' + robot.nsp;
	$('#messages').append($('<li>').text(msg));
};

$(document).ready(function() {
	$(".colorpicker").spectrum({
		color: "#000"
	});

	$(".bodyColor .colorpicker, .bodyColor input:radio, .bodyColor input:input[type=range]").change(function() {
		setLedColorColorAnimation({
			'ledStripIndex': 0,
			'animation': $('input[name=bodyColorAnimation]:checked').val(),
			'c1': $(".bodyColor #colorpicker1").spectrum("get").toHexString(),
			'c2': $(".bodyColor #colorpicker2").spectrum("get").toHexString(),
			'steps': $("#bodyColorAnimationSteps").val(),
			'interval': $("#bodyColorAnimationInterval").val(),
		});
	})
	$(".bodyColor .colorpicker").on('move.spectrum', function(e, tinycolor) {
		setLedColorColorAnimation({
			'ledStripIndex': 0,
			'animation': $('input[name=bodyColorAnimation]:checked').val(),
			'c1': $(".bodyColor #colorpicker1").spectrum("get").toHexString(),
			'c2': $(".bodyColor #colorpicker2").spectrum("get").toHexString(),
			'steps': $("#bodyColorAnimationSteps").val(),
			'interval': $("#bodyColorAnimationInterval").val(),
		});
	});

	$(".frontColor .colorpicker, .frontColor input:radio, .frontColor input:input[type=range]").change(function() {
		setLedColorColorAnimation({
			'ledStripIndex': 1,
			'animation': $('input[name=frontColorAnimation]:checked').val(),
			'c1': $(".frontColor #colorpicker1").spectrum("get").toHexString(),
			'c2': $(".frontColor #colorpicker2").spectrum("get").toHexString(),
			'steps': $("#frontColorAnimationSteps").val(),
			'interval': $("#frontColorAnimationInterval").val(),
		});
	})
	$(".frontColor .colorpicker").on('move.spectrum', function(e, tinycolor) {
		setLedColorColorAnimation({
			'ledStripIndex': 1,
			'animation': $('input[name=frontColorAnimation]:checked').val(),
			'c1': $(".frontColor #colorpicker1").spectrum("get").toHexString(),
			'c2': $(".frontColor #colorpicker2").spectrum("get").toHexString(),
			'steps': $("#frontColorAnimationSteps").val(),
			'interval': $("#frontColorAnimationInterval").val(),
		});
	});

	var options = {
		zone: document.getElementById('zone_joystick'),
		color: '#ff0000'

	};
	var manager = nipplejs.create(options);

	manager.on('added', function(evt, nipple) {
		nipple.on('dir:up', function(evt) {
			robot.emit('move', {
				'motor1' : 200,
				'motor2' : 200,
				'motor1dir' : 1,
				'motor2dir' : 1,
			});
			console.log("up");
		});
		nipple.on('dir:down', function(evt) {
			robot.emit('move', {
				'motor1' : 200,
				'motor2' : 200,
				'motor1dir' : 0,
				'motor2dir' : 0,
			});
			console.log("down");

		});
		nipple.on('dir:left', function(evt) {
			robot.emit('move', {
				'motor1' : 120,
				'motor2' : 120,
				'motor1dir' : 1,
				'motor2dir' : 0,
			});
			console.log("left");

		});
		nipple.on('dir:right', function(evt) {
			robot.emit('move', {
				'motor1' : 120,
				'motor2' : 120,
				'motor1dir' : 0,
				'motor2dir' : 1,
			});
			console.log("right");

		});
		nipple.on('end', function(evt) {
			robot.emit('stop');
			console.log("stop");

		});
	}).on('removed', function(evt, nipple) {
		nipple.off('start move end dir plain');
	});



});


function setLedColorColorAnimation(data) {
	if (data.animation == "static") {
		robot.emit('controlLeds', {
			'ledStripIndex': data.ledStripIndex,
			'color1': data.c1,
		});
	} else {
		robot.emit('controlLedsAnimation', {
			'ledStripIndex': data.ledStripIndex,
			'animation': data.animation,
			'color1': data.c1,
			'color2': data.c2,
			'steps': data.steps,
			'interval': data.interval
		});
	}
}


function getColorSensor() {
	robot.emit('getColorSensor');
}

function moveServo(angle) {
	robot.emit('moveServo', angle);
}

function setup() {
	var canvas = createCanvas(window.innerWidth, 100);
	canvas.parent('viz');
	//background(255,0,2);
}

function draw() {
	drawchart();
}

function logEvent(payload) {
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
