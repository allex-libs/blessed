function registrar (execlib, blessedlib) {
  'use strict';
  var lib = execlib.lib,
    propertyTargetHandlerRegistry = blessedlib.applinkinglib.propertyTargetHandlingRegistry,
    PropertyTargetHandler = propertyTargetHandlerRegistry.PropertyTargetHandler;

  function capitalize(str) {
    return str.replace(/\w\S*/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();});
  }

  function BlessedPropertyTargetHandler(propertycarrier, propertyname) {
    PropertyTargetHandler.call(this, propertycarrier, propertyname);
    this.blessed = propertycarrier;
    this.method = null;
    PropertyTargetHandler.findFinalCarrier(this);
    var methodname = 'set'+capitalize(propertyname);
    if (lib.isFunction(this.blessed[methodname])) {
      this.method = this.blessed[methodname].bind(this.blessed);
    }
  }
  lib.inherit(BlessedPropertyTargetHandler, PropertyTargetHandler);
  BlessedPropertyTargetHandler.prototype.destroy = function () {
    this.method = null;
    this.blessed = null;
    PropertyTargetHandler.prototype.destroy.call(this);
  };
  BlessedPropertyTargetHandler.prototype.handle = function (val) {
    if (this.method) {
      this.method(val);
    } else {
      this.carrier[this.name] = val;
    }
    this.blessed.screen.render();
  };
  BlessedPropertyTargetHandler.recognize = function (propertycarrierwithname) {
    if (propertycarrierwithname &&
      propertycarrierwithname.carrier &&
      blessedlib.isBlessedNode(propertycarrierwithname.carrier)) {
      return BlessedPropertyTargetHandler;
    }
  };

  propertyTargetHandlerRegistry.register(BlessedPropertyTargetHandler.recognize);
  
}

module.exports = registrar;
