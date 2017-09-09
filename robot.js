var Cylon = require('cylon');

Cylon.api('http');

Cylon.robot({

  name: "Shybo",

  connections: {
    audio: { adaptor: 'audio' },
    wekinator: { adaptor: 'wekinator' },
    myArduino: { adaptor: 'myArduino' },
    microphone: { adaptor: 'microphone' }

  },

  devices: {
    audio: { driver: 'audio' }
  },

  work: function(my) {
    constantly(function(){
      // my.stateMachine();
    });

    my.microphone.startRecording();

    var ledstatus=0;

    every((1).seconds(), function() {
      if (ledstatus){
        my.myArduino.digitalWrite(13,0);
        my.wekinator.startRecording();

      }else {
        my.myArduino.digitalWrite(13,1);
        my.wekinator.stopRecording();
      }
      ledstatus=!ledstatus;
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
