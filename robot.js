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
	],


	work: function(my) {
		constantly(function() {
			// my.stateMachine();
		});

		//my.microphone.startRecording();

		//wait some second before sending data to the serial port

		var ButtonPin = 2;

		after((3).seconds(), function() {
			my.myArduino.registerToButtonEvent(ButtonPin);

			my.myArduino.on('button', function(payload) {
				console.log(payload);
				if (payload.pin == ButtonPin && payload.value == 0) {

					console.log(my.microphone.status);

					if (my.microphone.status == 0) {
						my.microphone.startRecording();
					} else if (my.microphone.status == 2) {
						my.microphone.resumeRecording();
					}
				} else if (payload.pin == ButtonPin && payload.value == 1) {
					if (my.microphone.status == 1) {
						my.microphone.pauseRecording(() => {
							my.microphone.createNewFile((lastFile, newFile) => {
								console.log(lastFile, newFile);
								my.audio.play(lastFile);
							});
						});
					}
				}
				my.myArduino.readColorSensor();
			});

			//when receive a new color from the sensor, copy it to the ledstrip
			my.myArduino.on('color', function(payload) {
				console.log(payload);
				my.myArduino.setFullColor(payload.red, payload.green, payload.blue)
				my.emit('color_changed');
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

		//  every((.02).seconds(), function() {
		// 	 var fftData=my.microphone.getFFTData();
		// 	 my.emit('fft',fftData);
		// 	 my.wekinator.inputs(fftData);
		//  });

	},

	startRecording: function(){
		console.log("start recording");
		if (this.microphone.status == 0) {
			this.microphone.startRecording();
		} else if (this.microphone.status == 2) {
			this.microphone.resumeRecording();
		}
	},

	stopRecording: function(){
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

	stateMachine: function() {
		//console.log("stateMachine");
	},

	playSound: function() {
		my.audio.play('./assets/sound/meow.mp3');
	},

	doAThing: function() {
		console.log("I did a thing!");
	},

}).start();
