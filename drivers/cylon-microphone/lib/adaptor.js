"use strict";

var Cylon = require("cylon");
var fs = require('fs');
var uuid = require('uuid');
var soundengine = require('soundengine')
const FFT = require('fft.js');

var Adaptor = module.exports = function Adaptor(opts) {
	Adaptor.__super__.constructor.apply(this, arguments);
	opts = opts || {};

	// Start live transmission from the default input device to the default output device at 22kHz
	this.connector = this.engine = new soundengine.engine({
		sampleRate: 8000,
		bufferSize: 512,
	})

	console.log(this.connector.getOptions());

	this.engine.setMute(true);
	this.events = ['started', 'stopped', 'recorded', 'fftData'];

	this.status = 0;
	// 0->off
	// 1->recording
	// 2->paused

	this.lastrecordingPath = './recordings/recording.wav';
	this.newRecordingPath = "";

	const f = new FFT(64);
	const level=0;

	this.fftOut = f.createComplexArray();

	this.engine.on('data', (data) => {
		f.realTransform(this.fftOut, data);
		return data;
	});

	this.engine.on('playback_finished', () => {
		this.engine.setMute(true);
		this.enableMicrophone();
	})

	this.engine.on('recording_stopped', () => {
		this.engine.saveRecording(this.lastrecordingPath);
	})

	this.engine.on('recording_saved', () => {
		this.emit('recording_saved', this.lastrecordingPath);
	})

};

Cylon.Utils.subclass(Adaptor, Cylon.Adaptor);

Adaptor.prototype.connect = function(callback) {
	callback();
};

Adaptor.prototype.disconnect = function(callback) {
	callback();
};

Adaptor.prototype.startRecording = function(callback) {
	this.enableMicrophone();
	this.engine.setMute(true);
	Cylon.Logger.log("start recording");
	this.engine.startRecording();
	this.status = 1;
};

Adaptor.prototype.stopRecording = function(callback) {
	Cylon.Logger.log("stop recording");
	this.engine.stopRecording();
	this.status = 0;
	this.disableMicrophone();
};

Adaptor.prototype.playback = function(file) {
	this.disableMicrophone();
	this.engine.setMute(false);
	this.engine.loadRecording(file);
	this.engine.startPlayback();
};

Adaptor.prototype.getFFTData = function() {
	return (this.fftOut);
}

Adaptor.prototype.getSoundLevel = function() {
	return (this.fftOut.reduce((a, b) => Math.abs(a)+ Math.abs(b), 0));
}

Adaptor.prototype.enableOutput = function() {
	this.disableMicrophone();
	this.engine.setMute(false);
}

Adaptor.prototype.enableInput = function() {
	this.engine.setMute(true);
	this.enableMicrophone();
}

Adaptor.prototype.disableMicrophone = function() {
	// this.engine.setOptions({
	// 	'inputDevice': -1
	// })
}

Adaptor.prototype.enableMicrophone = function() {
	// this.engine.setOptions({
	// 	'inputDevice': 1
	// })
}
