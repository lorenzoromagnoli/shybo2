"use strict";

var Cylon = require("cylon");
var Wekinator = require("wekinator");

var Commands = require("./commands");


var Adaptor = module.exports = function Adaptor(opts) {
  Adaptor.__super__.constructor.apply(this, arguments);
  opts = opts || {};

  this.connector = this.wekinator = new Wekinator();
};


Cylon.Utils.subclass(Adaptor, Cylon.Adaptor);


Adaptor.prototype.connect = function(callback) {
  Cylon.Logger.log("Connecting to wekinator...");

  this.proxyMethods(Commands, this.wekinator, this);

  this.wekinator.connect(function(){
    Cylon.Logger.log("Connected to wekinator");
  });

  callback();
};

Adaptor.prototype.disconnect = function(callback) {
  callback();
};
