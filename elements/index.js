function createElements(execlib, blessedlib) {
  'use strict';
  
  var blessed = blessedlib.blessed,
    ElementContainerMixin,
    ElementBase,
    ElementContainer;

  ElementContainerMixin = require('./elementcontainermixincreator')(execlib, blessedlib);
  ElementBase = require('./elementbasecreator')(execlib, ElementContainerMixin);
  ElementContainer = require('./elementcontainercreator')(execlib, ElementContainerMixin);

  blessedlib.elementRegistry.register('container', ElementContainer);

  return {
    ElementContainerMixin: ElementContainerMixin,
    ElementBase: ElementBase
  };

}

module.exports = createElements;
