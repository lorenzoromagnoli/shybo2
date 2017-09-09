var Cylon = require('cylon');

Cylon.api('http');

Cylon.robot({

  name: "Shybo",

  connections: {
    audio: { adaptor: 'audio' },
    wekinator: { adaptor: 'wekinator' },
    myArduino: { adaptor: 'myArduino' }
  },

  devices: {
    audio: { driver: 'audio' }
  },


  work: function(me) {
    constantly(function(){
      // my.stateMachine();
    });

    var ledstatus=0;

    every((1).seconds(), function() {
      if (ledstatus){
        me.myArduino.digitalWrite(13,0);
        console.log("off");
        me.wekinator.startRecording();

      }else {
        me.myArduino.digitalWrite(13,1);
        console.log("on");
        me.wekinator.stopRecording();
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
