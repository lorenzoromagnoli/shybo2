var Cylon = require('cylon');
var express = require('express')
var app = express()
var path = require("path");
var cors = require('cors')

app.get('/', function(req, res) {
	res.sendFile(path.join(__dirname + '/interface/index.html'));
})

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
		microphone: {
			adaptor: 'microphone'
		}

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
	],


	work: function(my) {
		// constantly(function() {
		// 	// my.stateMachine();
		// });

		//my.microphone.startRecording();

		//wait some second before sending data to the serial port

		var ButtonPin = 2;

		var off_button_pin = 17;
		var teach_color_mode_Pin = 15;
		var teach_sound_mode_Pin = 14;
		var play_mode_Pin = 9;

		my.state = 0;


		after((3).seconds(), function() {
			my.myArduino.registerToButtonEvent(ButtonPin);
			my.myArduino.registerToButtonEvent(off_button_pin);
			my.myArduino.registerToButtonEvent(teach_color_mode_Pin);
			my.myArduino.registerToButtonEvent(teach_sound_mode_Pin);
			my.myArduino.registerToButtonEvent(play_mode_Pin);

			my.myArduino.on('button', function(payload) {
				console.log(payload);

				if (payload.pin == ButtonPin && payload.value == 0) {
					console.log(my.microphone.status);
					my.microphone.startRecording();
				} else if (payload.pin == ButtonPin && payload.value == 1) {
					my.microphone.stopRecording();
				} else if (payload.pin == off_button_pin && payload.value == 0) {
					console.log("bye bye");
					my.emit('mode_changed', 'off');
					my.goToState(0);
				} else if (payload.pin == teach_color_mode_Pin && payload.value == 0) {
					console.log("entering teach color mode");
					my.emit('mode_changed', 'teach_color');
					my.goToState(3);
				} else if (payload.pin == teach_sound_mode_Pin && payload.value == 0) {
					console.log("entering teach sound mode");
					my.emit('mode_changed', 'teach_sound');
					my.goToState(2);
				} else if (payload.pin == play_mode_Pin && payload.value == 0) {
					console.log("entering play mode");
					my.emit('mode_changed', 'play');
					my.goToState(1);
				}

				//my.myArduino.readColorSensor();
			});

			//when receive a new color from the sensor, copy it to the ledstrip
			my.myArduino.on('color', function(payload) {
				console.log(payload);
				my.emit('color_changed', payload);
			});

			//when I receive fft event from the microphone module reemit it
			my.myArduino.on('fft', function(payload) {
				console.log("got fft");
				console.log(payload.data);
			});

			//when I receive fft event from the microphone module reemit it
			my.myArduino.on('event', function(payload) {
				console.log("event");
				console.log(payload);
			});

			//when I receive fft event from the microphone module reemit it
			my.microphone.on('recording_saved', function(file) {
				my.microphone.playback(file);
				console.log(file);
			});

		});

		every((.05).seconds(), function() {
			var fftData = my.microphone.getFFTData();
			my.emit('fft', fftData);
			my.wekinator.inputs(fftData);
		});

		every((.05).seconds(), function() {
			my.stateMachine();
		});



		// every((4).seconds(), function() {
		// 	my.myArduino.motorWrite(0, 100, 1);
		// 	my.myArduino.motorWrite(1, 100, 1);
		// 	after((1).seconds(), function() {
		// 		my.myArduino.motorWrite(1, 100, 0);
		// 		my.myArduino.motorWrite(0, 100, 0);
		// 		after((2).seconds(), function() {
		// 			my.myArduino.motorStop();
		// 		});
		// 	});
		// });
		// every((4).seconds(), function() {
		// 	my.myArduino.ledsControl(2, 6, 3, 100, 10);
		// 	after((2).seconds(), function() {
		// 		my.myArduino.ledsControl(1, 7);
		// 	});
		// });

		my.goToState(0);
	},

	stateMachine: function() {
		//console.log("stateMachine");
		switch (this.state) {
			case 0:

				break;
			case 1: //shybo listen to wek
				if (this.microphone.getSoundLevel() > 200) {
					this.goToState(2);
				}
				break;
			case 2: //shybo is scared


				break;
			default:

		}
	},

	goToState: function(state) {
		console.log("going to state" + state);
		if (this.state != state) {
			this.state = state;
			switch (this.state) {
				case 0: //the robot is off
					this.reset();
					this.myArduino.servoShakeStop();
					this.myArduino.ledsControl(1, 'scanner', '#0000ff', '#000000', 100, 100);
					break;
				case 1: //the robot is calm
					this.myArduino.servoShakeStop();
					this.myArduino.servoWrite(20);
					this.myArduino.ledsControl(0, 'fade', '#ffffff', '#000000', 100, 30);
					this.myArduino.setFullColor(1, '#000000');
					this.wekinator.startRunning();
					break;
				case 2: //shybo gets scared and start shaking
					this.myArduino.servoShakeStart();
					this.myArduino.ledsControl(0, 'fade', '#ff0000', '#000000', 50, 30);
					after((2).seconds(), ()=> {
						this.goToState(1);
					});
					break;
				case 3:
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

	startRecording: function() {
		console.log("start recording");
		if (this.microphone.status == 0) {
			this.microphone.startRecording();
		} else if (this.microphone.status == 2) {
			this.microphone.resumeRecording();
		}
	},

	stopRecording: function() {
		console.log("stop recording");
		if (this.microphone.status == 1) {
			this.microphone.pauseRecording(() => {
				this.microphone.createNewFile((lastFile, newFile) => {
					console.log(lastFile, newFile);
					this.audio.play(lastFile);
				});
			});
		}
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

	playSound: function() {
		my.audio.play('./assets/sound/meow.mp3');
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

	}

}).start();
