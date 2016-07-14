function createElementBase (execlib, ElementContainerMixin) {
  'use strict';

  var lib = execlib.lib;

  function defaultElementCreationOptions(deco, descriptor) {
    if(lib.isFunction(deco)) {
      return deco(descriptor);
    }
    return deco;
  }

  function appender(parnt, elem) {
    if (lib.isFunction(elem.appendToBlessedNode)) {
      elem.appendToBlessedNode(parnt);
    } else {
      parnt.append(elem);
    }
  }

  function ElementBase (descriptor) {
    var bo = lib.extend({blessedoptions:{}}, defaultElementCreationOptions(this.defaultElementCreationOptions));
    if (descriptor.name) {
      bo.name = descriptor.name;
    }
    lib.extend(bo.blessedoptions, descriptor.blessedoptions);
    this.blessed = ElementContainerMixin.createElement(bo);
    ElementContainerMixin.call(this, descriptor);
    this.elements.traverse(appender.bind(null, this.blessed));
  }
  ElementContainerMixin.addMethods(ElementBase);
  ElementBase.prototype.destroy = function () {
    if (this.blessed) {
      this.blessed.destroy();
    }
    this.blessed = null;
    ElementContainerMixin.prototype.destroy.call(this);
  };
  ElementBase.prototype.defaultElementCreationOptions = {};
  ElementBase.prototype.show = function () {
    this.blessed.show();
    ElementContainerMixin.prototype.show.call(this);
  };
  ElementBase.prototype.hide = function () {
    this.blessed.hide();
    ElementContainerMixin.prototype.hide.call(this);
  };
  ElementBase.prototype.detach = function () {
    this.blessed.detach();
    ElementContainerMixin.prototype.detach.call(this);
  };
  ElementBase.prototype.appendToBlessedNode = function (parnt) {
    parnt.append(this.blessed);
    ElementContainerMixin.prototype.appendToBlessedNode.call(this, parnt);
  };

  return ElementBase;
}

module.exports = createElementBase;
