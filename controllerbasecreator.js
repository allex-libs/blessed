function createControllerBase (execlib) {
  'use strict';

  function ControllerBase(blessedenvironment) {
    this.environment = blessedenvironment;
    this.environmentStateListener = blessedenvironment.attachListener('state', this.onEnvironmentState.bind(this));
  }
  ControllerBase.prototype.destroy = function () {
    if (this.environmentStateListener) {
      this.environmentStateListener.destroy();
    }
    this.environmentStateListener = null;
    this.environment = null;
  };
  ControllerBase.prototype.onEnvironmentState = function (blessedenvironment) {
  };


  return ControllerBase;
}

module.exports = createControllerBase;
