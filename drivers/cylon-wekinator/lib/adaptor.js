"use strict";

var Cylon = require("cylon");
var Wekinator = require("wekinator");
var child_process = require('child_process');



var Commands = require("./commands");


var Adaptor = module.exports = function Adaptor(opts) {
  Adaptor.__super__.constructor.apply(this, arguments);
  opts = opts || {};
  this.connector = this.wekinator = new Wekinator();
};

Cylon.Utils.subclass(Adaptor, Cylon.Adaptor);

Adaptor.prototype.connect = function(callback) {
  Cylon.Logger.log("Connecting to wekinator...");
	// var wekinator = child_process.spawn('java',[ '-jar', './utils/wekinator/WekiMini.jar', './assets/wek/test/WekinatorProject/WekinatorProject.wekproj']);
	//
	// wekinator.stdout.on('data', (data) => {
	// 	console.log(`stdout: ${data}`);
	// });
	//
	// wekinator.stderr.on('data', (data) => {
	// 	console.log(`stderr: ${data}`);
	// });
	//
	// wekinator.on('close', (code) => {
	// 	console.log(`child process exited with code ${code}`);
	// });

  this.proxyMethods(Commands, this.wekinator, this);

  this.wekinator.connect(function(){
    Cylon.Logger.log("Connected to wekinator");
  });

	this.wekinator.on("osc", (a)=>{
			// When we recieve a message from Wekinator, log it
			console.log(a);
			this.emit('wek_class', a.args[0]);
		});

  callback();
};

Adaptor.prototype.disconnect = function(callback) {
  callback();
};
