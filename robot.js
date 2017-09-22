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

		var ButtonPin=2;

    after((3).seconds(), function() {
      my.myArduino.registerToButtonEvent(ButtonPin);

      my.myArduino.on('button', function(payload) {
        console.log(payload);
        if (payload.pin==ButtonPin && payload.value==0){

			console.log(my.microphone.status);

			if (my.microphone.status==0){
				my.microphone.startRecording();
			}else if (my.microphone.status==2){
				my.microphone.resumeRecording();
			}
        }else if (payload.pin==ButtonPin && payload.value==1){
					if (my.microphone.status==1){
          	my.microphone.pauseRecording(()=>{
							my.microphone.createNewFile((lastFile, newFile)=>{
								console.log(lastFile, newFile);
								my.audio.play(lastFile);
							});
						});
					}
        }
      });

    });

		//  every((4).seconds(),function(){
		// 	  	my.myArduino.motorWrite(1,100,1);
		//  });

		every((4).seconds(),function(){
			my.myArduino.motorWrite(0,100,1);
			my.myArduino.motorWrite(1,100,1);
			after((1).seconds(), function() {
				my.myArduino.motorWrite(1,100,0);
				my.myArduino.motorWrite(0,100,0);
				after((2).seconds(), function() {
					my.myArduino.motorStop();
				});
			});
		});

		my.myArduino.ledsControl(0,6,3,100,10);

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
