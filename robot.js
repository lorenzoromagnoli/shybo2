var Cylon = require('cylon');

Cylon.api('http');

Cylon.robot({

  name: "Shybo",

  connections: {
    audio: { adaptor: 'audio' }
  },

  devices: {
    audio: { driver: 'audio' }
  },


  work: function(my) {
    constantly(function(){
      my.stateMachine();
    });
  },


   stateMachine: function(){
     console.log("stateMachine");
   },

   playSound:function(){
     my.audio.play('./assets/sound/meow.mp3');
   },

    doAThing: function() {
     console.log("I did a thing!");
   },


}).start();
