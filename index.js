function createLib(execlib) {
  var blessed = require('blessed'),
    lib = execlib.lib,
    ControllerBase = require('./controllerbasecreator')(execlib),
    PageController = require('./pagecontrollercreator')(execlib, ControllerBase),
    elementsSuite,
    ret;

  /*
   * Use elementRegistry to register classes having at least
   * methods `hide`, `show`, `appendToBlessedNode`, `detach`
   * and ctor accepting a descriptor
   */


  try {
  ret = {
    blessed: blessed,
    elementRegistry: new execlib.lib.DIContainer()
  };
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
