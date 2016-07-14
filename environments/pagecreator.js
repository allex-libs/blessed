function createBlessedPage (execlib, blessedlib) {
  'use strict';

  var lib = execlib.lib;

  function BlessedPage (descriptor, blessedenvironment) {
    ElementBase.call(this, descriptor);
    this.shown = new lib.HookCollection();
    this.hidden = new lib.HookCollection();
    this.controller = null;
    if(lib.isArray(descriptor.elements)) {
      descriptor.elements.forEach(this.addPageElement.bind(this, blessedenvironment));
    }
    if (lib.isFunction(descriptor.controller)) {
      this.controller = new (descriptor.controller)(this, blessedenvironment);
    }
  }
  BlessedPage.prototype.destroy = function () {
    if (this.controller) {
      this.controller.destroy();
    }
    this.controller = null;
    if (this.hidden) {
      this.hidden.destroy();
    }
    this.hidden = null;
    if (this.shown) {
      this.shown.destroy();
    }
    this.shown = null;
    ElementBase.prototype.destroy.call(this);
  };

  BlessedPage.prototype.addPageElement = function (blessedenvironment, edesc) {
    var el = createPageElement(edesc, blessedenvironment);
    if (el) {
      this.elements.add(edesc.name, el);
    }
  };

  BlessedPage.prototype.run = function () {
    this.show();
  };

  BlessedPage.prototype.show = function () {
    this.elements.traverse(function (element) {element.show();});
  };

  BlessedPage.prototype.hide = function () {
    this.elements.traverse(function (element) {element.hide();});
  };

  function appender(parnt, element) {
    if (lib.isFunction(element.appendToBlessedNode)) {
      element.appendToBlessedNode(parnt);
    } else {
      parnt.append(element);
    }
  }

  BlessedPage.prototype.appendTo = function (parnt) {
    this.elements.traverse(appender.bind(null, parnt));
    parnt = null;
  };

  BlessedPage.prototype.detach = function () {
    this.elements.traverse(function (element) {element.detach();});
  };

  return BlessedPage;
}

module.exports = createBlessedPage;
