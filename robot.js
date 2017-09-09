var Cylon = require('cylon');

// init serial port
var SerialPort = require('serialport');
var port = new SerialPort('/dev/cu.usbmodem1421', {
  baudRate: 9600
});


Cylon.api('http');

Cylon.robot({

  name: "Shybo",

  connections: {
    audio: { adaptor: 'audio' },
    wekinator: { adaptor: 'wekinator' }
  },

  devices: {
    audio: { driver: 'audio' }
  },


  work: function(my) {
    constantly(function(){
      // my.stateMachine();
    });

    var ledstatus=0;

    every((1).seconds(), function() {
      if (ledstatus){
        my.ledOff();
        console.log("off");
      }else {
        my.ledOn();
        console.log("on");
      }
      ledstatus=!ledstatus;
    });
  },


  ledOff: function(){
    port.write('LO'+'\r'+'\n', function(err) {
      if (err) {
        return console.log('Error on write: ', err.message);
      }
      console.log('message written');
    });
  },

  ledOn: function(){
    port.write('L1'+'\r'+'\n', function(err) {
      if (err) {
        return console.log('Error on write: ', err.message);
      }
      console.log('message written');
    });
  },

   stateMachine: function(){
     //console.log("stateMachine");
   },

   playSound:function(){
     my.audio.play('./assets/sound/meow.mp3');
   },

    doAThing: function() {
     console.log("I did a thing!");
   },

}).start();
