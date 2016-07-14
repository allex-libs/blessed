function createPageController (execlib, ControllerBase) {
  'use strict';

  var lib = execlib.lib;

  function PageController (blessedpage, blessedenvironment) {
    ControllerBase.call(this, blessedenvironment);
    this.page = blessedpage;
  }
  lib.inherit(PageController, ControllerBase);
  PageController.prototype.destroy = function () {
    this.page = null;
    ControllerBase.prototype.destroy.call(this);
  };

  return PageController;
}

module.exports = createPageController;
