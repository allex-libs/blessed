function createEnvironmentFactory (execlib, blessedlib) {
  'use strict';

  var lib = execlib.lib,
    BlessedEnvironmentBase = require('./basecreator')(execlib, blessedlib),
    AllexRemoteBlessedEnvironment = require('./allexremotecreator')(execlib, BlessedEnvironmentBase),
    elementRegistry = blessedlib.elementRegistry;


  elementRegistry.register('allexremoteenvironment', AllexRemoteBlessedEnvironment);

  /*
  function factory(descriptor, environment) {
    var ctor;
    switch (environment.type) {
      case 'allexremote':
        ctor = AllexRemoteBlessedEnvironment;
        break;
      default:
        throw new lib.Error('UNKNOWN_ENVIRONMENT_TYPE', 'Environment type '+environment.type+' is not recognized');
    }
    return new ctor(descriptor, environment);
  }

  return factory;
  */
}

module.exports = createEnvironmentFactory;
