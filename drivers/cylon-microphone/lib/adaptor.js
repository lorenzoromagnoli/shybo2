"use strict";

var Cylon = require("cylon");
var fs = require('fs');
var lame = require('lame');
var uuid = require('uuid');
var Analyser = require('audio-analyser');
const coreAudio = require("node-core-audio")
var stream = require('stream');


var Adaptor = module.exports = function Adaptor(opts) {
	Adaptor.__super__.constructor.apply(this, arguments);
	opts = opts || {};

	// Start live transmission from the default input device to the default output device at 22kHz


	//this.engine.setMute(true);
	this.events = ['started', 'stopped', 'recorded', 'fftData'];

	this.status = 0;
	// 0->off
	// 1->recording
	// 2->paused

	this.lastrecordingPath = './recordings/recording.wav';
	this.newRecordingPath = "";

	this.fftData;

	//setup audio analyser
	this.analyser = new Analyser({
		// Magnitude diapasone, in dB
		minDecibels: -100,
		maxDecibels: 0,

		// Number of time samples to transform to frequency
		fftSize: 256,

		// Number of frequencies, twice less than fftSize
		frequencyBinCount: 256 / 2,

		// Smoothing, or the priority of the old data over the new data
		smoothingTimeConstant: 0.2,

		// Number of channel to analyse
		channel: 1,

		// Size of time data to buffer
		bufferSize: 1024,

		// Windowing function for fft, https://github.com/scijs/window-functions
		// applyWindow: function(sampleNumber, totalSamples) {
		// 	//console.log(sampleNumber, totalSamples);
		// },

		//...pcm-stream params, if required
		// 'pcm-stream': {
		// 	channels: 1,
		// 	sampleRate: 44000,
		// 	bitDepth: 32,
		// 	float: true,
		// 	signed: true,
		// 	byteOrder: 'BE',
		// 	samplesPerFrame: 1024,
		// }

	});


	// // Apply a beep to the output when recording has stopped
	// this.engine.on('recording_stopped', () => {
	// 	this.engine.saveRecording(this.lastrecordingPath);
	// 	this.engine.beep({
	// 		frequency: 300
	// 	})
	// })
	//
	// this.engine.on('recording_saved', () => {
	// 	this.emit('recording_saved', this.lastrecordingPath);
	// })
	// this.engine.on('playback_finished', () => {
	// 	//console.log(data);
	// 	this.engine.setMute(true);
	// 	this.enableMicrophone();
	// })


	this.audioStream = new stream.PassThrough();
	//when I get the data I can pipe in to the stream

	this.processAudio =function ( inputBuffer ) {
		console.log(inputBuffer[0][0])

		return inputBuffer;
	}

	this.connector = this.engine = coreAudio.createNewAudioEngine()
	this.engine.addAudioCallback(this.processAudio)

	//this.engine.setSampleRate( 100 );


	// this.engine.setFFTCallback((channel, samples) => {
	//     console.log(channel);
	// })
	// //throw the stream in the encoder
	this.audioStream.pipe(this.analyser);
};

Cylon.Utils.subclass(Adaptor, Cylon.Adaptor);

Adaptor.prototype.connect = function(callback) {
	callback();
};

Adaptor.prototype.disconnect = function(callback) {
	callback();
};

Adaptor.prototype.startRecording = function(callback) {
	//this.enableMicrophone();
	//this.engine.setMute(true);
	Cylon.Logger.log("start recording");
	//this.engine.startRecording();
	this.status = 1;
};

Adaptor.prototype.stopRecording = function(callback) {
	Cylon.Logger.log("stop recording");
	//this.engine.stopRecording();
	this.status = 0;
	//this.disableMicrophone();
};

Adaptor.prototype.playback = function(file) {
	// this.disableMicrophone();
	// this.engine.setMute(false);
	// this.engine.loadRecording(file);
	// this.engine.startPlayback();
};

Adaptor.prototype.getFFTData = function() {
	this.fftData = this.analyser.getFrequencyData();
	return (this.fftData);
}

Adaptor.prototype.disableMicrophone = function() {
	this.engine.setOptions({
		'inputDevice': -1
	})
}

Adaptor.prototype.enableMicrophone = function() {
	this.engine.setOptions({
		'inputDevice': 0
	})
}
