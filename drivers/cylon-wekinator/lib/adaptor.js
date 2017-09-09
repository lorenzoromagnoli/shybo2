"use strict";

var Cylon = require("cylon");
var LibWekinator = require("wekinator");


var Adaptor = module.exports = function Wekinator(opts) {
  Adaptor.__super__.constructor.apply(this, arguments);
  opts = opts || {};

};

Cylon.Utils.subclass(Adaptor, Cylon.Adaptor);

Adaptor.prototype.connect = function(callback) {
  callback();
};

Adaptor.prototype.disconnect = function(callback) {
  callback();
};
