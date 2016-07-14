function createElementContainer (execlib, ElementContainerMixin) {
  'use strict';

  var lib = execlib.lib;

  function ElementContainer (descriptor) {
    ElementContainerMixin.call(this, descriptor);
  }
  ElementContainerMixin.addMethods(ElementContainer);

  ElementContainer.prototype.show = function () {
    this.elements.traverse(function (element) {element.show();});
    ElementContainerMixin.prototype.show.call(this);
  };

  ElementContainer.prototype.hide = function () {
    this.elements.traverse(function (element) {element.hide();});
    ElementContainerMixin.prototype.hide.call(this);
  };

  function appender(parnt, element) {
    if (lib.isFunction(element.appendToBlessedNode)) {
      element.appendToBlessedNode(parnt);
    } else {
      parnt.append(element);
    }
  }

  ElementContainer.prototype.appendToBlessedNode = function (parnt) {
    this.elements.traverse(appender.bind(null, parnt));
    ElementContainerMixin.prototype.appendToBlessedNode.call(this, parnt);
    parnt = null;
  };

  ElementContainer.prototype.detach = function () {
    this.elements.traverse(function (element) {element.detach();});
    ElementContainerMixin.prototype.detach.call(this);
  };

  return ElementContainer;
}

module.exports = createElementContainer;
