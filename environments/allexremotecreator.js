function createAllexRemoteBlessedEnvironment (execlib, BlessedEnvironmentBase) {
  'use strict';

  var lib = execlib.lib;

  function AllexRemoteBlessedEnvironment(blessedoptions, environment) {
    BlessedEnvironmentBase.call(this, blessedoptions, environment);
  }
  lib.inherit(AllexRemoteBlessedEnvironment, BlessedEnvironmentBase);

  return AllexRemoteBlessedEnvironment;
}

module.exports = createAllexRemoteBlessedEnvironment;
