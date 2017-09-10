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
  this.SerialPortName = "";

  SerialPort.list( (err, ports) =>  {

    ports.forEach(  (port)=> {
      //if on mac
      if (port.comName.indexOf('/dev/tty.usbmodem') > -1) {
        this.SerialPortName = port.comName;
      }
      //if on raspi
      else if (port.comName.indexOf('/dev/ttyACM') > -1) {
        this.SerialPortName = port.comName;
      }
    });

    if (this.SerialPortName != "") {
      this.connector = this.myArduino = this.port = new SerialPort(this.SerialPortName, {
        baudRate: 9600
      }, function(err) {
        if (err) {
          Cylon.Logger.log("connection to serial port didn't work");
        } else {
          Cylon.Logger.log("connected to " + this.SerialPortName);
          callback();
        }
      });
    } else {
      Cylon.Logger.log("are you sure you connected your arduino???");
    }
  });

};

Adaptor.prototype.disconnect = function(callback) {
  callback();
};

Adaptor.prototype.digitalWrite = function(pin, value) {
  var message = 'DW/' + pin + '/' + value + '\r' + '\n';
  this.myArduino.write(message);
  Cylon.Logger.log("written " + message + " to myArduino");
}
