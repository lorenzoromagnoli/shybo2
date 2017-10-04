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

  const Readline = SerialPort.parsers.Readline;
  this.parser = new Readline();

  this.SerialPortName = "";

  SerialPort.list( (err, ports) =>  {

    ports.forEach(  (port)=> {
      //if on mac
      if (port.comName.indexOf('/dev/tty.usbmodem') > -1) {
        this.SerialPortName = port.comName;
      }
      //if connected via usb
      else if (port.comName.indexOf('/dev/ttyACM') > -1) {
        this.SerialPortName = port.comName;
      }
			//if connected on default raspi serial port on gpio
      else if (port.comName.indexOf('/dev/ttyAMA') > -1) {
        this.SerialPortName = port.comName;
      }
    });

    if (this.SerialPortName != "") {
      Cylon.Logger.log("connecting to " + this.SerialPortName);

      this.connector = this.myArduino = this.port = new SerialPort(this.SerialPortName, {
        baudRate: 9600
      }, (err)=> {
        if (err) {
          Cylon.Logger.log("connection to serial port didn't work");
        } else {
          Cylon.Logger.log("connected");

          //parse the incoming data
          this.port.pipe(this.parser);
          this.parser.on('data', (data)=>{
            this.parseSerial(data);
          });

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

Adaptor.prototype.digitalRead = function(pin) {
  var message = 'DR/' + pin + '/' + '\r' + '\n';
  this.myArduino.write(message);
  Cylon.Logger.log("written " + message + " to myArduino");
}

Adaptor.prototype.registerToButtonEvent = function(pin) {
  Cylon.Logger.log("registestering to button event on pin "+pin);
  var message = 'RB/' + pin + '\r' + '\n';
  this.myArduino.write(message);
  Cylon.Logger.log("written " + message + " to myArduino");
}

Adaptor.prototype.motorWrite = function(motor, speed, direction) {
  Cylon.Logger.log("writing to motor: "+motor+", speed: "+speed+", direction: "+direction );
  var message = 'MW/' + motor + '/'+ speed +'/'+ direction +'\r' + '\n';
  this.myArduino.write(message);
  Cylon.Logger.log("written " + message + " to myArduino");
}

Adaptor.prototype.setFullColor = function(r,g,b) {
  Cylon.Logger.log("setting color: red"+r+", green: "+g+", blue: "+b);
  var message = 'LD/1/'+ r +'/'+ g+'/'+ g+'/'+'\r' + '\n';
  this.myArduino.write(message);
  Cylon.Logger.log("written " + message + " to myArduino");
}

Adaptor.prototype.ledsControl = function(animation, color1, color2, steps, interval) {
  Cylon.Logger.log("writing to ledstrip: _ , animation: "+animation+", color1: "+color1+", color2: "+color2+", steps: "+steps+", interval: "+interval );
  var message = 'LD/' + animation + '/'+ color1 +'/'+ color2+'/'+ steps+'/'+ interval +'\r' + '\n';
  this.myArduino.write(message);
  Cylon.Logger.log("written " + message + " to myArduino");
}

Adaptor.prototype.motorStop = function(motor, speed, direction) {
  Cylon.Logger.log("stopping motors");
	this.motorWrite(0,0,0);
	this.motorWrite(1,0,0);
}

Adaptor.prototype.servoWrite = function(angle) {
  Cylon.Logger.log("writing to servo");
	var message = 'SW/' + angle + '\r' + '\n';
  this.myArduino.write(message);
  Cylon.Logger.log("written " + message + " to myArduino");
}

Adaptor.prototype.readColorSensor=function(){
	var message = 'RC/' +'\r' + '\n';
	this.myArduino.write(message);
}

Adaptor.prototype.parseSerial = function(data) {
  var message=data.split("/");
  if (message[0]=='BE'){
    this.emit('button',{
      'pin':message[1],
      'value':message[2]
    });
  }else if (message[0]=='CE'){
		this.emit('color',{
			'red':message[1],
			'green':message[2],
			'blue':message[3],
		});
	}
}
