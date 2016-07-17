function createElementContainerMixin (execlib, blessedlib) {
  'use strict';

  var lib = execlib.lib,
    ChangeableListenable = lib.ChangeableListenable,
    blessed = blessedlib.blessed;

  function ElementContainerMixin (descriptor) {
    ChangeableListenable.call(this);
    this.elements = new lib.Map();
    this.links = new lib.Map();
    this.visible = null;
    this.attached = null;
    if (lib.isArray(descriptor.elements)) {
      descriptor.elements.forEach(produceAndAddElement.bind(null, this));
    }
    blessedlib.applinkinglib.produceLinks(this, descriptor.links);
    if (descriptor.hasOwnProperty('visible')) {
      this.set('visible', descriptor.visible);
    }
    if (descriptor.hasOwnProperty('attached')) {
      this.set('attached', descriptor.attached);
    }
  }
  ElementContainerMixin.prototype.destroy = function () {
    this.attached = null;
    this.visible = null;
    if (this.links) {
      lib.containerDestroyAll(this.links);
      this.links.destroy();
    }
    this.links = null;
    if (this.elements) {
      lib.containerDestroyAll(this.elements);
      this.elements.destroy();
    }
    this.elements = null;
    ChangeableListenable.prototype.destroy.call(this);
  };
  ElementContainerMixin.prototype.show = function () {
    this.set('visible', true);
  };
  ElementContainerMixin.prototype.hide = function () {
    this.set('visible', false);
  };
  ElementContainerMixin.prototype.detach = function () {
    this.set('attached', null);
  };
  ElementContainerMixin.prototype.appendToBlessedNode = function (parnt) {
    this.set('attached', parnt);
  };
  ElementContainerMixin.prototype.set_visible = function (visible) {
    if (this.visible === visible) {
      return false;
    }
    this.visible = visible;
    visible ? this.show() : this.hide();
    return true;
  };
  ElementContainerMixin.prototype.set_attached = function (parnt) {
    if (this.attached === parnt) {
      return false;
    }
    this.attached = parnt;
    parnt ? this.appendToBlessedNode(parnt) : this.detach();
    return true;
  };
  ElementContainerMixin.prototype.elementNamed = function (elementname) {
    if (!this.elements) {
      return void 0;
    }
    return this.elements.get(elementname);
  };
  ElementContainerMixin.prototype.addAppLink = function (name, link, linkhash) {
    var ol;
    name = name || lib.uid();
    ol = this.links.replace(name, link);
    if (ol) {
      console.log('there was already a listener at ', name);
      ol.destroy();
    }
  };
  function blessedChildFinder(findhash, chld) {
    if (chld && chld.name === findhash.name) {
      findhash.child = chld;
      return true;
    }
    console.log(chld.name, '!==', findhash.name);
  }
  function findBlessedChild (blessedparnt, childname) {
    var findhash = {child: null, name: childname}, ret;
    blessedparnt.children.some(blessedChildFinder.bind(null, findhash));
    ret = findhash.child;
    findhash = null;
    if (ret && ret.get('allexcontroller')) {
      ret = ret.get('allexcontroller');
    }
    return ret;
  }
  function getter(res, elementname) {
    var e;
    if (!res.element) {
      return res;
    }
    /*
    if (!lib.isFunction(res.element.getElement)) {
      console.log('no getElement on ', typeof res.element);
      process.exit(0);
      return;
    }
    */
    if (blessedlib.isBlessedNode(res.element)) {
      e = findBlessedChild(res.element, elementname);
    } else {
      e = res.element.getElement(elementname);
    }
    if (!e) {
      console.log('Element', elementname, 'could not be found', res.element);
      //console.log('Element', elementname, 'could not be found within', res.element.elements.keys());
    }
    res.element = e;
    return res;
  }
  ElementContainerMixin.prototype.getElement = function (elementpath) {
    if (lib.isString(elementpath) && elementpath.indexOf('.')>=0) {
      return elementpath.split('.').reduce(getter, {element: this}).element;
    }
    return this.elements.get(elementpath);
  };
  ElementContainerMixin.createElement = createElement;

  ElementContainerMixin.addMethods = function (klass) {
    ChangeableListenable.addMethods(klass);
    lib.inherit(klass, ChangeableListenable);
    lib.inheritMethods(klass, this, 'set_visible', 'set_attached', 'elementNamed', 'addAppLink', 'getElement');
  }

  function produceAndAddElement (eb, desc) {
    var el = createElement(desc);
    if (el) {
      eb.elements.add(desc.name, el);
    }
  }

  function blessed2BlessedAdder (parnt, chld) {
    if (blessedlib.isBlessedNode(chld)) {
      parnt.append(chld);
    }
    if (chld instanceof blessedlib.ElementBase) {
      chld.appendToBlessedNode(parnt);
    }
  }

  function createElement(descriptor) {
    var dt, dn, ector, ret;
    if (!descriptor) {
      throw new lib.Error('NO_PAGE_ELEMENT_DESCRIPTOR', 'No descriptor given to create an element from');
    }
    if (!descriptor.type) {
      throw new lib.JSONizingError('NO_TYPE_IN_PAGE_ELEMENT_DESCRIPTOR', descriptor, 'No type specified');
    }
    if (!descriptor.name) {
      throw new lib.JSONizingError('NO_NAME_IN_PAGE_ELEMENT_DESCRIPTOR', descriptor, 'No name specified');
    }
    dt = descriptor.type;
    dn = descriptor.name;
    ector = blessed[dt];
    if (lib.isFunction(ector)) {
      ret = ector(descriptor.blessedoptions);
      ret.name = descriptor.name;
    }
    ector = blessedlib.elementRegistry.get(dt);
    if (lib.isFunction(ector)) {
      ret =  new ector(descriptor);
    }
    if (blessedlib.isBlessedNode(ret) && descriptor.elements) {
      descriptor.elements.map(createElement).forEach(blessed2BlessedAdder.bind(null, ret));
    }
    return ret;
    throw new lib.JSONizingError('UNKNOWN_PAGE_ELEMENT_TYPE', descriptor, 'Could not recognize type');
  }


  return ElementContainerMixin;
}

module.exports = createElementContainerMixin;
