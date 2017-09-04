var Cylon = require('cylon');

Cylon.robot({
  connections: {
    audio: { adaptor: 'audio' }
  },

  devices: {
    audio: { driver: 'audio' }
  },

  work: function(my) {
    my.audio.on("complete", function(){
      console.log("Done playing this nice sound.");
    });

    // You can pass a string with a full or relative path here,
    my.audio.play('./assets/sound/meow.mp3');
  }
}).start();
