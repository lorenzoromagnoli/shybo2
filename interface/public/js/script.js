var robot;
var fftData;

window.onload = function() {
	console.log('Setting up socket connections:');
	// Once we have a list of available robots we can use
	// any of them and connect to their socket.

	url=window.location.href ;
	splitted=url.split(':');
	wsUrl=splitted[0]+':'+splitted[1]+':3001';
	console.log(wsUrl);

	robot = io(wsUrl+'/api/robots/Shybo');
	robot.on('message', function(payload) {

		if (payload.name=='fft'){
			if (payload.data){
				fftData=payload.data;
				drawchart();
			}

		}else{
			console.log('On Robot');
			console.log('  Name:', payload.name);
			console.log('  Type:', payload.type);
			console.log('  Data:', payload.data);
			$('#messages').prepend($('<li>').text('On Robot:'));
			$('#messages').prepend($('<li>').text('event:' + payload.name.toString()));
			if (!!payload.data) {
				$('#messages').prepend($('<li>').text('data:' + payload.data.toString()));
			}
			$('#messages').prepend($('<hr />'));
		}
	});
	msg = 'You have been subscribed to Cylon sockets:' + robot.nsp;
	$('#messages').append($('<li>').text(msg));
};


function setup(){
	var canvas =createCanvas(640, 480);
	canvas.parent('viz');
	//background(255,0,2);

}

function draw(){

}


function drawchart(){
	background(255);
	var barwidth=width/256;
	for (var i=0; i<256; i++){
		fill(0);
		rect(i*barwidth,height+fftData[i],i*barwidth,-fftData[i]);
	}
}
