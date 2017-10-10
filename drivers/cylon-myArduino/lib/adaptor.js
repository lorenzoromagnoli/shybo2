"use strict";

var Cylon = require("cylon");
// init serial port
var SerialPort = require('serialport');
const rgbHex = require('rgb-hex');
var hexToRgb = require('hex-rgb');

var Adaptor = module.exports = function Adaptor(opts) {
	Adaptor.__super__.constructor.apply(this, arguments);
	opts = opts || {};

};

Cylon.Utils.subclass(Adaptor, Cylon.Adaptor);

Adaptor.prototype.connect = function(callback) {

	const Readline = SerialPort.parsers.Readline;
	this.parser = new Readline();

	this.SerialPortName = "";

	this.shakeStarted = false;

	this.queue = [];
	this.busy = false;
	this.current = null;


	SerialPort.list((err, ports) => {

		ports.forEach((port) => {
			//if on mac
			if (port.comName.indexOf('/dev/tty.usbmodem') > -1) {
				this.SerialPortName = port.comName;
			}
			//if connected via usb
			else if (port.comName.indexOf('/dev/tty.Re') > -1) {
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
				baudRate: 57600
			}, (err) => {
				if (err) {
					Cylon.Logger.log("connection to serial port didn't work");
				} else {
					Cylon.Logger.log("connected");

					//parse the incoming data
					this.port.pipe(this.parser);
					this.parser.on('data', (data) => {
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


Adaptor.prototype.send = function(data, callback) {
	this.queue.push(data);
	if (this.busy){
		return;
	} else{
		this.busy = true;
		this.processQueue();
	}

};

Adaptor.prototype.processQueue = function() {
	var next = this.queue.shift();

	if (!next) {
		this.busy = false;
		return;
	}

	this.current = next;
	this.myArduino.write(next);
};


Adaptor.prototype.disconnect = function(callback) {
	callback();
};

Adaptor.prototype.digitalWrite = function(pin, value) {
	var message = 'DW/' + pin + '/' + value + '\r' + '\n';
	this.send(message);
	Cylon.Logger.log("written " + message + " to myArduino");
}

Adaptor.prototype.digitalRead = function(pin) {
	var message = 'DR/' + pin + '/' + '\r' + '\n';
	this.send(message);
	Cylon.Logger.log("written " + message + " to myArduino");
}

Adaptor.prototype.registerToButtonEvent = function(pin) {
	Cylon.Logger.log("registestering to button event on pin " + pin);
	var message = 'RB/' + pin + '\r' + '\n';
	this.send(message);
	Cylon.Logger.log("written " + message + " to myArduino");
}

Adaptor.prototype.setInput = function(pin) {
	Cylon.Logger.log("setting" + pin+ " as input");
	var message = 'RI/' + pin + '\r' + '\n';
	this.send(message);
	Cylon.Logger.log("written " + message + " to myArduino");
}

Adaptor.prototype.readAnalogue = function(pin) {
	//Cylon.Logger.log("reading analogue value from pin"+ pin);
	var message = 'AR/' + pin + '\r' + '\n';
	this.send(message);
	//Cylon.Logger.log("written " + message + " to myArduino");
}

Adaptor.prototype.motorWrite = function(motor, speed, direction) {
	Cylon.Logger.log("writing to motor: " + motor + ", speed: " + speed + ", direction: " + direction);
	var message = 'MW/' + motor + '/' + speed + '/' + direction + '\r' + '\n';
	this.send(message);
	Cylon.Logger.log("written " + message + " to myArduino");
}

Adaptor.prototype.motorStop = function() {
	Cylon.Logger.log("stopping motors");
	this.motorWrite(0, 0, 0);
	this.motorWrite(1, 0, 0);
}

Adaptor.prototype.setFullColor = function(ledStripIndex, color) {
	Cylon.Logger.log("setting color: red" + hexToRgb(color)[0]+ ", green: " + hexToRgb(color)[1] + ", blue: " + hexToRgb(color)[2]);
	var message = 'LD/' + ledStripIndex + '/' + 'static/' + hexToRgb(color)[0] + '/' + hexToRgb(color)[1] + '/' + hexToRgb(color)[2] + '/' + '\r' + '\n';
	this.send(message);
	Cylon.Logger.log("written " + message + " to myArduino");
}

Adaptor.prototype.setFullColorRGB = function(ledStripIndex, r,g,b) {
	Cylon.Logger.log("setting color: red" + r + ", green: " + g + ", blue: " + b);
	var message = 'LD/' + ledStripIndex + '/' + 'static/' + r + '/' + g + '/' + b + '/' + '\r' + '\n';
	this.send(message);
	Cylon.Logger.log("written " + message + " to myArduino");
}


Adaptor.prototype.ledsControl = function(ledStripIndex, animation, color1, color2, steps, interval) {
	Cylon.Logger.log("writing to ledstrip: "+ledStripIndex+", animation: " + animation + ", color1: " + color1 + ", color2: " + color2 + ", steps: " + steps + ", interval: " + interval);
	var message = 'LD/' + ledStripIndex + '/' + animation + '/' + hexToRgb(color1)[0] + '/' + hexToRgb(color1)[1] + '/' + hexToRgb(color1)[2] + '/' + hexToRgb(color2)[0] + '/' + hexToRgb(color2)[1] + '/' + hexToRgb(color2)[2] + '/' + steps + '/' + interval + '\r' + '\n';
	this.send(message);
	Cylon.Logger.log("written " + message + " to myArduino");
}

Adaptor.prototype.colorwheel = function(ledStripIndex, offset) {
	Cylon.Logger.log("writing to ledstrip: "+ offset +" , standardColorwheel offsetBy" + offset);
	var message = 'LD/' + ledStripIndex + '/COLORWHEEL/' + offset + '\r' + '\n';
	this.send(message);
	Cylon.Logger.log("written " + message + " to myArduino");
}

Adaptor.prototype.ledCount = function(ledStripIndex, color1, color2, number) {
	Cylon.Logger.log("writing to ledstrip: "+ledStripIndex+" , animation: count, color1: " + color1 + ", color2: " + color2 + ", number: " + number);
	var message = 'LD/' + ledStripIndex + '/COUNT/' + hexToRgb(color1)[0] + '/' + hexToRgb(color1)[1] + '/' + hexToRgb(color1)[2] + '/' + hexToRgb(color2)[0] + '/' + hexToRgb(color2)[1] + '/' + hexToRgb(color2)[2] + '/' + number + '\r' + '\n';
	this.send(message);
	Cylon.Logger.log("written " + message + " to myArduino");
}


Adaptor.prototype.servoWrite = function(angle) {
	Cylon.Logger.log("writing to servo");
	var message = 'SW/' + angle + '\r' + '\n';
	this.send(message);
	Cylon.Logger.log("written " + message + " to myArduino");
}

Adaptor.prototype.servoShakeStart = function() {
	if (!this.shakeStarted) {
		Cylon.Logger.log("writing to servo");
		var message = 'SS/1' + '\r' + '\n';
		this.send(message);
		Cylon.Logger.log("written " + message + " to myArduino");
		this.shakeStarted = true;
	}
}

Adaptor.prototype.servoShakeStop = function() {
	Cylon.Logger.log("writing to servo");
	var message = 'SS/0' + '\r' + '\n';
	this.send(message);
	Cylon.Logger.log("written " + message + " to myArduino");
	this.shakeStarted = false;
}


Adaptor.prototype.readColorSensor = function() {
	var message = 'RC/' + '\r' + '\n';
	this.send(message);
}

Adaptor.prototype.parseSerial = function(data) {
	if (data.indexOf('ok') != -1) {
		this.processQueue();
	//	console.log('-');
	} else {
		var message = data.split("/");
		//console.log(data);
		if (message[0] == 'BE') {
			console.log(data);
			this.emit('button', {
				'pin': message[1],
				'value': message[2]
			});
		} else if (message[0] == 'CE') {
			console.log(data);
			if(parseInt(message[1])<256 &&parseInt(message[2])<256 &&parseInt(message[3])<256){
				this.emit('color', {
					'red': parseInt(message[1]),
					'green': parseInt(message[2]),
					'blue': parseInt(message[3]),
				});
			}else{
				this.emit('color', {
					'red': 0,
					'green': 0,
					'blue': 0,
				});
			}

		} else if (message[0] == 'AR') {
			this.emit('analogue', {
				'pin': message[1],
				'value': message[2],
			});
		}
	}
}
