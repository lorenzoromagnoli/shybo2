"use strict";

var Cylon = require("cylon");
var fs = require('fs');
var mic = require('mic');
var lame = require('lame');



var Adaptor = module.exports = function Adaptor(opts) {
  Adaptor.__super__.constructor.apply(this, arguments);
  opts = opts || {};

  this.connector=this.microphone=mic({
    rate: '16000',
    channels: '1',
    debug: false,
    exitOnSilence: 6
  });

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
  this.outputFileStream = fs.WriteStream('./recordings/recording.mp3');

  // the generated MP3 file gets piped to stdout
  this.encoder.pipe(this.outputFileStream);

  //throw the stream in the encoder
  this.micInputStream.pipe(this.encoder);



};

Cylon.Utils.subclass(Adaptor, Cylon.Adaptor);

Adaptor.prototype.connect = function(callback) {
  callback();
};

Adaptor.prototype.disconnect = function(callback) {
  callback();
};

Adaptor.prototype.startRecording = function(callback) {
  this.microphone.start();
};
