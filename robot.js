var Cylon = require('cylon');
var express = require('express')
var app = express()
var path = require("path");
var cors = require('cors')
const fileUpload = require('express-fileupload');
const rgbHex = require('rgb-hex');
var hexRgb = require('hex-rgb');
var cd = require('color-difference');
var osc = require('osc');

app.get('/', function(req, res) {
	res.sendFile(path.join(__dirname + '/interface/index.html'));
})

app.use(fileUpload());

app.post('/upload', function(req, res) {
	if (!req.files) {
		return res.status(400).send('No files were uploaded.');
	} else {
		for (var i = 0; i < 8; i++) {
			if (req.files['sound' + i]) {
				console.log(i, req.files['sound' + i].name);
				req.files['sound' + i].mv('./assets/sound/sound' + i + '.mp3', function(err) {
					if (err) {
						console.log(err);
						return res.status(500).send(err);
					}
				});
			}
		}
		res.send('File uploaded!');
	}
});

app.use('/', express.static(path.join(__dirname, '/interface/public')))

// app.use(cors());
app.listen(4000);

Cylon.api('http', {
	ssl: false // serve unsecured, over HTTP
});

var allowedOrigins = "http://localhost:* http://127.0.0.1:*";

Cylon.api('socketio', {
	name: 'socketio',
	host: '0.0.0.0',
	port: '3001',
	auth: false,
	CORS: '*:*',

});

Cylon.robot({

	name: "Shybo",

	connections: {
		audio: {
			adaptor: 'audio'
		},
		wekinator: {
			adaptor: 'wekinator'
		},
		myArduino: {
			adaptor: 'myArduino'
		},
		// microphone: {
		// 	adaptor: 'microphone'
		// }

	},

	devices: {
		audio: {
			driver: 'audio'
		}
	},

	events: [
		'turned_on',
		'turned_off',
		'color_changed',
		'fft',
		'mode_changed',
		'loudness'
	],


	work: function(my) {

		//wait some second before sending data to the serial port

		var record_button_Pin = 2;

		var off_button_pin = 17;
		var teach_color_mode_Pin = 15;
		var teach_sound_mode_Pin = 14;
		var play_mode_Pin = 9;

		my.pot_pin = 16;
		my.potValue = 0;

		my.state = 0;

		my.recordButtonStatus = 0;

		my.wekinatorClass = 0;
		my.wekinatorOldClass = 0;

		my.soundClass = 0;
		my.soundOldClass = 0;

		my.noiseLevel = 0.2;
		my.minimumSoundLevel = 0.005;

		my.colorSensorColor = {
			red: 0,
			green: 0,
			blue: 0
		};

		my.colorwheel = ['#15af00', '#00e8d1', '#0073c8', '#9500ff', '#7d007d', '#ff0000', '#e15a00', '#e1e600'];
		my.savedColors = ['#000000', '#000000', '#000000', '#000000', '#000000', '#000000', '#000000', '#000000', ];

		my.colorSensor;

		my.soundIsPlaying = false;

		my.audio.on("complete", function() {
			// console.log("Done playing this nice sound.");
			// my.microphone.enableInput();
			my.soundIsPlaying = false;
		});


		my.udpPort = new osc.UDPPort({
			// This is the port we're listening on.
			localAddress: "127.0.0.1",
			localPort: 9001,

			// This is where sclang is listening for OSC messages.
			remoteAddress: "127.0.0.1",
			remotePort: 9000,
			metadata: true
		});

		my.fft = [];
		my.loudness;

		my.udpPort.on("message", function(oscMessage) {
			//console.log ("received");
			if (oscMessage.address == '/fft') {
				my.loudness = oscMessage.args[0].value;
				for (var i = 1; i < oscMessage.args.length-1; i++) {
					my.fft[i - 1] = oscMessage.args[i].value;
				}
			}
		});

		my.udpPort.on("error", function(err) {
			console.log(err);
		});

		my.udpPort.open();


		after((3).seconds(), function() {
			my.myArduino.registerToButtonEvent(record_button_Pin);
			my.myArduino.registerToButtonEvent(off_button_pin);
			my.myArduino.registerToButtonEvent(teach_color_mode_Pin);
			my.myArduino.registerToButtonEvent(teach_sound_mode_Pin);
			my.myArduino.registerToButtonEvent(play_mode_Pin);
			my.myArduino.setInput(my.pot_pin);

			my.myArduino.on('button', function(payload) {
				console.log(payload);

				if (payload.pin == record_button_Pin && payload.value == 0) {
					my.recordButtonStatus = 1;
					// 	console.log(my.microphone.status);
					// 	my.microphone.startRecording();
				} else if (payload.pin == record_button_Pin && payload.value == 1) {
					my.recordButtonStatus = 0;
					// 	my.microphone.stopRecording();
				} else if (payload.pin == off_button_pin && payload.value == 0) {
					console.log("bye bye");
					my.emit('mode_changed', 'off');
					my.goToState(0);
				} else if (payload.pin == teach_color_mode_Pin && payload.value == 0) {
					console.log("entering teach color mode");
					my.emit('mode_changed', 'teach_color');
					my.goToState(5);
				} else if (payload.pin == teach_sound_mode_Pin && payload.value == 0) {
					console.log("entering teach sound mode");
					my.emit('mode_changed', 'teach_sound');
					my.goToState(3);
				} else if (payload.pin == play_mode_Pin && payload.value == 0) {
					console.log("entering play mode");
					my.emit('mode_changed', 'play');
					my.goToState(1);
				}
				//my.myArduino.readColorSensor();
			});

			every((.1).seconds(), function() {
				my.getFFT();

				my.emit('fft', my.fft);
				my.emit('loudness', my.loudness);

				if (my.loudness > my.minimumSoundLevel) {
					my.wekinator.inputs(my.fft);
				}
			});

			every((.05).seconds(), function() {
				my.stateMachine();
			});


			my.myArduino.on('analogue', function(payload) {
				if (payload.pin == my.pot_pin) {
					my.potValue = payload.value;
				}
			});

			my.wekinator.on('wek_class', function(payload) {
				my.wekinatorClass = payload;
			});

			//when receive a new color from the sensor
			my.myArduino.on('color', function(payload) {
				console.log(payload);
				my.emit('color_changed', payload);
				my.colorSensorColor = payload;
			});
		});

		my.goToState(0);
	},

	stateMachine: function() {
		//console.log("stateMachine");
		switch (this.state) {
			case 0:

				break;
			case 1: //shybo listen to wek
				if (this.loudness > this.noiseLevel) {
					this.goToState(2);
				} else {
					if (this.wekinatorClass != this.wekinatorOldClass) {
						this.myArduino.setFullColor(0, this.colorwheel[this.wekinatorClass - 1]);
						this.wekinatorOldClass = this.wekinatorClass;
					}
				}
				break;
			case 2: //shybo is scared
				break;
			case 3: //shybo in training sound mode
				this.myArduino.readAnalogue(this.pot_pin);
				this.wekinatorClass = Math.floor((this.potValue / 1024) * 8);
				if (this.wekinatorClass != this.wekinatorOldClass) {
					this.wekinator.outputs([this.wekinatorClass + 1]);
					this.myArduino.colorwheel(1, this.wekinatorClass);
					this.myArduino.setFullColor(0, this.colorwheel[this.wekinatorClass]);
					this.wekinatorOldClass = this.wekinatorClass;
				}
				if (this.recordButtonStatus) {
					this.goToState(4)
				}
				break;
			case 4: //shybo is recording sound
				if (!this.recordButtonStatus) {
					this.goToState(3)
				}
				break;
			case 5: //shybo is in train sound Mode
				this.myArduino.readAnalogue(this.pot_pin);
				this.soundClass = Math.floor((this.potValue / 1024) * 8);
				if (this.soundClass != this.soundOldClass) {
					this.myArduino.ledCount(1, '#aaaaaa', '#000000', this.soundClass);
					this.playSound(this.soundClass);
					this.myArduino.setFullColor(0, this.savedColors[this.soundClass]);
					this.soundOldClass = this.soundClass;
				}
				if (this.recordButtonStatus) {
					this.goToState(6)
				}
				break;
			case 6: //shybo should be reading colors
				this.savedColors[this.soundClass] = '#' + rgbHex(this.colorSensorColor.red, this.colorSensorColor.green, this.colorSensorColor.blue);

				if (!this.recordButtonStatus) {
					this.goToState(5)
				}

				break;

			default:
		}
	},

	goToState: function(state) {
		console.log("_________________");
		console.log("going to state" + state);
		console.log("_________________");


		if (this.state != state) {
			this.state = state;
			// this.microphone.forceSync();
			switch (this.state) {
				case 0: //the robot is off
					this.reset();
					this.myArduino.servoShakeStop();
					this.myArduino.ledsControl(1, 'scanner', '#0000aa', '#000000', 100, 100);
					this.wekinator.stopRunning();
					clearInterval(this.colorSensor);

					break;
				case 1: //the robot is calm
					this.myArduino.servoShakeStop();
					this.myArduino.servoWrite(20);

					this.myArduino.ledsControl(0, 'fade', '#ffffff', '#000000', 100, 30);
					this.myArduino.setFullColor(1, '#000000');
					this.wekinator.train();

					this.colorSensor = every((1).seconds(), () => {
						this.myArduino.readColorSensor();
						after((.5).seconds(), () => {
							var similarColor = this.lookForSimilarColor('#' + rgbHex(this.colorSensorColor.red, this.colorSensorColor.green, this.colorSensorColor.blue));
							console.log("similarColor", similarColor);
							if (similarColor.index != -1) {
								this.playSound(similarColor.index);
							}
						});
					});

					after((2).seconds(), () => {
						this.wekinator.startRunning();
					});
					break;
				case 2: //shybo gets scared and start shaking
					this.myArduino.servoShakeStart();
					this.myArduino.ledsControl(0, 'fade', '#ff0000', '#000000', 50, 30);
					after((2).seconds(), () => {
						this.goToState(1);
					});
					clearInterval(this.colorSensor);
					break;
				case 3: //shybo await the user for selecting a class to be associated with the sound
					this.wekinatorOldClass = -1; //forcing reading on changs
					this.wekinator.stopRecording();
					this.wekinator.stopRunning();
					clearInterval(this.colorSensor);
					break;
				case 4: // goes into recording mode, trigger wekinator start
					this.wekinator.startRecording();
					this.wekinator.stopRunning();
					clearInterval(this.colorSensor);
					break;
				case 5:
					this.soundOldClass = -1; //forcing reading on changs
					this.myArduino.setFullColor(0, this.savedColors[this.soundClass]);
					clearInterval(this.colorSensor);
					break;
				case 6:
					this.myArduino.readColorSensor();
					clearInterval(this.colorSensor);
					break;

			}
		}

	},

	reset: function() {
		this.stop();
		this.myArduino.setFullColor(1, '#000000');
		this.myArduino.setFullColor(0, '#000000');
	},


	controlLedsAnimation: function(data) {
		this.myArduino.ledsControl(data.ledStripIndex, data.animation, data.color1, data.color2, data.steps, data.interval);
	},
	controlLeds: function(data) {
		this.myArduino.setFullColor(data.ledStripIndex, data.color1);
	},

	// startRecording: function() {
	// 	console.log("start recording");
	// 	if (this.microphone.status == 0) {
	// 		this.microphone.startRecording();
	// 	} else if (this.microphone.status == 2) {
	// 		this.microphone.resumeRecording();
	// 	}
	// },

	// stopRecording: function() {
	// 	console.log("stop recording");
	// 	if (this.microphone.status == 1) {
	// 		this.microphone.pauseRecording(() => {
	// 			this.microphone.createNewFile((lastFile, newFile) => {
	// 				console.log(lastFile, newFile);
	// 				this.audio.play(lastFile);
	// 			});
	// 		});
	// 	}
	// },

	changeSoundLevels: function(data) {
		console.log("changing sound level");
		this.noiseLevel = data.max;
		this.minimumSoundLevel = data.min;
	},

	getColorSensor: function() {
		this.myArduino.readColorSensor();
	},

	moveServo: function(angle) {
		console.log("moveServo");
		this.myArduino.servoWrite(angle);
	},

	turnOn: function() {
		this.emit('turned_on', {
			data: 'pass some data to the listener'
		});
	},

	turnOff: function() {
		this.emit('turned_off', {
			data: 'pass some data to the listener'
		});
	},

	playSound: function(index) {
		if (this.soundIsPlaying) {
			this.audio.stop();
			console.log("stopping sound");
		}
		// this.microphone.enableOutput();
		this.audio.play('./assets/sound/sound' + index + '.mp3');
		this.soundIsPlaying = true;
	},

	doAThing: function() {
		console.log("I did a thing!");
	},

	move: function(data) {
		this.myArduino.motorWrite(1, data.motor1, data.motor1dir);
		this.myArduino.motorWrite(2, data.motor2, data.motor2dir);
	},
	stop: function() {
		this.myArduino.motorStop();

	},
	getFFT: function() {
		var msg = {
			address: "/run_bastard",
			args: [{
					type: "i",
					value: 256
				},

			]
		};
		//console.log("Sending message", msg.address, msg.args, "to", this.udpPort.options.remoteAddress + ":" + this.udpPort.options.remotePort);
		this.udpPort.send(msg);
	},
	stopFFT: function() {
		var msg = {
			address: "/stop",
		};
		//console.log("Sending message", msg.address, msg.args, "to", this.udpPort.options.remoteAddress + ":" + this.udpPort.options.remotePort);
		this.udpPort.send(msg);
	},
	lookForSimilarColor: function(color) {
		var similarColor = {
			index: 0,
			difference: 100
		};
		for (var i = 0; i < this.savedColors.length; i++) {
			var colorDifference = cd.compare(color, this.savedColors[i]);
			if (colorDifference < similarColor.difference) {
				similarColor.index = i;
				similarColor.difference = colorDifference;
			}
		}
		if (similarColor.difference < 15) {
			return similarColor;
		} else {
			return -1;
		}
	}

}).start();

function componentToHex(c) {
	var hex = c.toString(16);
	return hex.length == 1 ? "0" + hex : hex;
}

function rgbToHex(r, g, b) {
	return "#" + componentToHex(r) + componentToHex(g) + componentToHex(b);
}

function hexToRgb(hex) {
	var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
	return result ? {
		r: parseInt(result[1], 16),
		g: parseInt(result[2], 16),
		b: parseInt(result[3], 16)
	} : null;
}
