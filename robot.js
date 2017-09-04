var Cylon=require ('cylon')

Cylon.robot({

	connections:{
		audio:{adaptor:'audio'}
	},

	devices:{
		audio:{driver:'audio'}
	},
	work: function(my){
		every((5).second(),function(){
			console.log("meow!!!");
			my.audio.play("assets/sounds/Kitty-meow.mp3");
		});
	}	
}).start();