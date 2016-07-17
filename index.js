function createLib(execlib) {
  return execlib.loadDependencies('client', ['allex:applinking:lib'], realCreator.bind(null, execlib));
}


function realCreator (execlib, applinkinglib) {
  var blessed = require('blessed'),
    lib = execlib.lib,
    ControllerBase = require('./controllerbasecreator')(execlib),
    PageController = require('./pagecontrollercreator')(execlib, ControllerBase),
    elementsSuite,
    ret;

  function isBlessedNode (thingy) {
    return thingy && thingy instanceof blessed.Node;
  }

  try {
  ret = {
    blessed: blessed,
    isBlessedNode: isBlessedNode,
    applinkinglib: applinkinglib,
    elementRegistry: new execlib.lib.DIContainer()
  };
  require('./registrar')(execlib, ret);
  elementsSuite = require('./elements') (execlib, ret);
  lib.extend(ret, elementsSuite);
  App = require('./appcreator')(execlib, ret);
  } catch(e) {
    console.error(e.stack);
    console.error(e);
    process.exit(0);
  }

  ret.App = App;
  return ret;
};

module.exports = createLib;
