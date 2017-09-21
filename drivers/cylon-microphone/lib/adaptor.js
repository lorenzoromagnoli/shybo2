"use strict";

var Cylon = require("cylon");
var fs = require('fs');
var mic = require('mic');
var lame = require('lame');
var uuid = require('uuid');



var Adaptor = module.exports = function Adaptor(opts) {
  Adaptor.__super__.constructor.apply(this, arguments);
  opts = opts || {};

  this.connector=this.microphone=mic({
	rate: '16000',
	channels: '1',
	debug: false,
	exitOnSilence: 6
  });

  this.status=0;
  // 0->off
  // 1->recording
  // 2->paused

	this.lastrecordingPath='./recordings/recording.mp3';
	this.newRecordingPath=""

  this.encoder = new lame.Encoder({
	// input
	channels: 1,        // 2 channels (left and right)
	bitDepth: 16,       // 16-bit samples
	sampleRate: 16000,  // 44,100 Hz sample rate

	// output
	bitRate: 128,
	outSampleRate: 22050,
	mode: lame.STEREO // STEREO (default), JOINTSTEREO, DUALCHANNEL or MONO
  });

  this.micInputStream = this.microphone.getAudioStream();

  //when open the stream pipe it to the filewriter
  this.outputFileStream = fs.WriteStream(this.lastrecordingPath);

  // the generated MP3 file gets piped to stdout
  this.encoder.pipe(this.outputFileStream);

  //throw the stream in the encoder
  this.micInputStream.pipe(this.encoder);

  this.micInputStream.on('data', function(data) {
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
  this.status=1;
};

Adaptor.prototype.pauseRecording = function(callback) {
  Cylon.Logger.log("pause recording");
  this.microphone.pause();
  this.status=2;
	callback();
};


Adaptor.prototype.stopRecording = function(callback) {
  Cylon.Logger.log("stop recording");
  this.microphone.stop();
  this.status=0;
};

Adaptor.prototype.resumeRecording = function(callback) {
  Cylon.Logger.log("resuming recording");
  this.microphone.resume();
  this.status=1;
};

Adaptor.prototype.createNewFile = function(callback) {
	//clode the previous file
	this.outputFileStream.end();

	this.newRecordingPath='./recordings/recording'+uuid.v1()+'.mp3'
	var newFIle=this.newRecordingPath;

	//create a new file
  this.outputFileStream = fs.WriteStream(this.newRecordingPath);
	// repipe the encoder to the new file
	this.encoder.pipe(this.outputFileStream);
	// return the filename in a callback
	callback(this.lastrecordingPath, this.newRecordingPath);
	this.lastrecordingPath=this.newRecordingPath;
};
