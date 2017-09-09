"use strict";

var Cylon = require("cylon");
// init serial port
var SerialPort = require('serialport');


var Adaptor = module.exports = function Adaptor(opts) {
  Adaptor.__super__.constructor.apply(this, arguments);
  opts = opts || {};
};

Cylon.Utils.subclass(Adaptor, Cylon.Adaptor);

Adaptor.prototype.connect = function(callback) {
  callback();

  this.connector = this.myArduino = this.port = new SerialPort('/dev/cu.usbmodem1421', {
    baudRate: 9600
  });

};

Adaptor.prototype.disconnect = function(callback) {
  callback();
};

Adaptor.prototype.digitalWrite=function(pin, value){
  var message='DW/'+pin+'/'+value+'\r'+'\n';
  this.myArduino.write (message);
  Cylon.Logger.log("written "+ message + " to myArduino");
}
