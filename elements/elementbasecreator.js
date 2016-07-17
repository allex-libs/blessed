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
    this.blessed.set('allexcontroller', this);
    ElementContainerMixin.call(this, descriptor);
    this.elements.traverse(appender.bind(null, this.blessed));
  }
  ElementContainerMixin.addMethods(ElementBase);
  ElementBase.prototype.destroy = function () {
    if (this.blessed) {
      this.blessed.set('allexcontroller', null);
      this.blessed.destroy();
    }
    this.blessed = null;
    ElementContainerMixin.prototype.destroy.call(this);
  };
  ElementBase.prototype.defaultElementCreationOptions = {};
  ElementBase.prototype.show = function () {
    this.blessed.show();
    ElementContainerMixin.prototype.show.call(this);
    this.blessed.screen.render();
  };
  ElementBase.prototype.hide = function () {
    this.blessed.hide();
    ElementContainerMixin.prototype.hide.call(this);
    this.blessed.screen.render();
  };
  ElementBase.prototype.detach = function () {
    this.blessed.detach();
    ElementContainerMixin.prototype.detach.call(this);
    this.blessed.screen.render();
  };
  ElementBase.prototype.appendToBlessedNode = function (parnt) {
    parnt.append(this.blessed);
    ElementContainerMixin.prototype.appendToBlessedNode.call(this, parnt);
    this.blessed.screen.render();
  };
  ElementBase.prototype.getElement = function (elementpath) {
    if (elementpath === 'blessed') {
      return this.blessed;
    }
    return ElementContainerMixin.prototype.getElement.call(this, elementpath);
  };

  return ElementBase;
}

module.exports = createElementBase;
