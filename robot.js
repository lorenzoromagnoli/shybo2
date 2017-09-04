var Cylon = require('cylon');

Cylon.api('http');

Cylon.robot({
  connections: {
    audio: { adaptor: 'audio' }
  },

  devices: {
    audio: { driver: 'audio' }
  },

  work: function(my) {
    // my.audio.on("complete", function(){
    //   console.log("Done playing this nice sound.");
    // });

    // You can pass a string with a full or relative path here,
    every((5).seconds(), function(){

      console.log("Hello world!");
      my.audio.play('./assets/sound/meow.mp3');

    });

  },

  commands: {
     do_a_thing: function() { this.doAThing.call(this); }
   },

  doAThing: function() {
   console.log("I did a thing!");
 }


}).start();
