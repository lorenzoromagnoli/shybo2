var Cylon = require('cylon');

Cylon.api('http');

Cylon.robot({

  name: "Shybo",

  connections: {
    audio: {
      adaptor: 'audio'
    },
    wekinator: {
      adaptor: 'wekinator'
    },
    myArduino: {
      adaptor: 'myArduino'
    },
    microphone: {
      adaptor: 'microphone'
    }

  },

  devices: {
    audio: {
      driver: 'audio'
    }
  },

  work: function(my) {
    constantly(function() {
      // my.stateMachine();
    });

    //my.microphone.startRecording();

    //wait some second before sending data to the serial port
    after((3).seconds(), function() {
      my.myArduino.registerToButtonEvent(9);

      my.myArduino.on('button', function(payload) {
        console.log(payload);
        if (payload.pin==9 && payload.value==0){
          my.microphone.startRecording();
        }else if (payload.pin==9 && payload.value==1){
          my.microphone.stopRecording();
          my.audio.play('./recordings/recording.mp3');
        }
      });

    });

    var ledstatus = 0;

    every((1).seconds(), function() {

      //my.myArduino.digitalRead(9);


      // if (ledstatus){
      //   my.myArduino.digitalWrite(13,0);
      //   my.wekinator.startRecording();
      //
      // }else {
      //   my.myArduino.digitalWrite(13,1);
      //   my.wekinator.stopRecording();
      // }
      // ledstatus=!ledstatus;
    });
  },


  stateMachine: function() {
    //console.log("stateMachine");
  },

  playSound: function() {
    my.audio.play('./assets/sound/meow.mp3');
  },

  doAThing: function() {
    console.log("I did a thing!");
  },

}).start();
