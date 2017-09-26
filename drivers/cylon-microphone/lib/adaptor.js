"use strict";

var Cylon = require("cylon");
var fs = require('fs');
var mic = require('./mic.js');
var lame = require('lame');
var uuid = require('uuid');
var Analyser = require('audio-analyser');


var Adaptor = module.exports = function Adaptor(opts) {
	Adaptor.__super__.constructor.apply(this, arguments);
	opts = opts || {};

	this.connector = this.microphone = mic({
		rate: '8000',
		channels: '1',
		debug: true,
		buffer:500,
		bitwidth:8,
	});

	this.events=['started','stopped', 'recorded', 'fftData' ];

	this.status = 0;
	// 0->off
	// 1->recording
	// 2->paused

	this.lastrecordingPath = './recordings/recording.mp3';
	this.newRecordingPath = "";

	this.fftData;

	this.encoder = new lame.Encoder({
		// input
		channels: 1, // 2 channels (left and right)
		bitDepth: 16, // 16-bit samples
		sampleRate: 8000, // 44,100 Hz sample rate

		// output
		bitRate: 128,
		outSampleRate: 16000,
		mode: lame.STEREO // STEREO (default), JOINTSTEREO, DUALCHANNEL or MONO
	});

	//setup audio analyser
	this.analyser = new Analyser({
		// Magnitude diapasone, in dB
		minDecibels: -1000,
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
		bufferSize: 22050,

		// Windowing function for fft, https://github.com/scijs/window-functions
		// applyWindow: function(sampleNumber, totalSamples) {
		// 	//console.log(sampleNumber, totalSamples);
		// },

		//...pcm-stream params, if required
		'pcm-stream': {
			channels: 1,
			sampleRate: 8000,
			bitDepth: 8,
			byteOrder: 'LE',
			max: 32767,
			min: -32768,
			samplesPerFrame: 1024,
		}

	});


	this.micInputStream = this.microphone.getAudioStream();

	//when open the stream pipe it to the filewriter
	this.outputFileStream = fs.WriteStream(this.lastrecordingPath);

	// the generated MP3 file gets piped to stdout
	this.encoder.pipe(this.outputFileStream);

	//pipe the analyser
	this.analyser.pipe(this.encoder);

	//throw the stream in the encoder
	this.micInputStream.pipe(this.analyser);

	this.micInputStream.on('data', (data) => {
		console.log("Recieved Input Stream: " + data.length);
	});

};

Cylon.Utils.subclass(Adaptor, Cylon.Adaptor);

Adaptor.prototype.connect = function(callback) {
	callback();
};

Adaptor.prototype.disconnect = function(callback) {
	callback();
};

Adaptor.prototype.startRecording = function(callback) {
	Cylon.Logger.log("start recording");
	this.microphone.start();
	this.status = 1;
};

Adaptor.prototype.pauseRecording = function(callback) {
	Cylon.Logger.log("pause recording");
	this.microphone.pause();
	this.status = 2;
	callback();
};

Adaptor.prototype.stopRecording = function(callback) {
	Cylon.Logger.log("stop recording");
	this.microphone.stop();
	this.status = 0;
};

Adaptor.prototype.resumeRecording = function(callback) {
	Cylon.Logger.log("resuming recording");
	this.microphone.resume();
	this.status = 1;
};

Adaptor.prototype.getFFTData=function(){
	this.fftData=this.analyser.getFrequencyData();
	return(this.fftData);
}

Adaptor.prototype.createNewFile = function(callback) {
	//clode the previous file
	this.outputFileStream.end();

	this.newRecordingPath = './recordings/recording' + uuid.v1() + '.mp3'
	var newFIle = this.newRecordingPath;

	//create a new file
	this.outputFileStream = fs.WriteStream(this.newRecordingPath);
	// repipe the encoder to the new file
	this.encoder.pipe(this.outputFileStream);
	// return the filename in a callback
	callback(this.lastrecordingPath, this.newRecordingPath);
	this.lastrecordingPath = this.newRecordingPath;
};
