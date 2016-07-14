function createBlessedApp (execlib, blessedlib) {
  'use strict';

  var lib = execlib.lib,
    environmentFactory = require('./environments/registrar')(execlib, blessedlib),
    blessed = blessedlib.blessed,
    ElementBase = blessedlib.ElementBase;

  function elementDecorator (environments, desc) {
    var env = environments.get(desc.environment);
    if (env) {
      desc.environment = env;
    }
  }

  function registerElement(elementdesc) {
    blessedlib.elementRegistry.register(elementdesc.name, elementdesc.ctor);
  }

  function BlessedApp(appdescriptor, environments) {
    try {
      Error.stackTraceLimit = 150;
    if (lib.isArray(appdescriptor.elements)) {
      appdescriptor.elements.forEach(elementDecorator.bind(null, environments));
    }
    if (lib.isArray(appdescriptor.register)) {
      appdescriptor.register.forEach(registerElement);
    }
    ElementBase.call(this, appdescriptor);
    console.log('new BlessedApp', this.elements.count);
    this.blessed.enableMouse();
    this.blessed.key(['escape', 'C-c'], this.destroy.bind(this));
    this.elements.get('remote').appendToBlessedNode(this.blessed);
    this.blessed.render();
    } catch(e) {
      console.error(e.stack);
      console.error(e);
      this.destroy();
    }
  }
  BlessedApp.prototype.destroy = function () {
    process.exit(0);
  };
  BlessedApp.prototype.defaultElementCreationOptions = {
    type: 'screen',
    name: 'App',
    blessedoptions: {
    }
  };

  return BlessedApp;
}

module.exports = createBlessedApp;
