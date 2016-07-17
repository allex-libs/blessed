function createElements(execlib, blessedlib) {
  'use strict';
  
  var blessed = blessedlib.blessed,
    ElementContainerMixin,
    ElementBase,
    ElementContainer,
    AllexTableElement;

  ElementContainerMixin = require('./elementcontainermixincreator')(execlib, blessedlib);
  ElementBase = require('./elementbasecreator')(execlib, ElementContainerMixin);
  ElementContainer = require('./elementcontainercreator')(execlib, ElementContainerMixin);
  AllexTableElement = require('./allextablecreator')(execlib, ElementBase);

  blessedlib.elementRegistry.register('container', ElementContainer);
  blessedlib.elementRegistry.register('allextable', AllexTableElement);

  return {
    ElementContainerMixin: ElementContainerMixin,
    ElementBase: ElementBase
  };

}

module.exports = createElements;
