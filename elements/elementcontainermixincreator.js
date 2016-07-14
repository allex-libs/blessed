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
    if (lib.isArray(descriptor.links)) {
      descriptor.links.forEach(produceLink.bind(null, this));
    }
    if (descriptor.hasOwnProperty('visible')) {
      console.log('setting visible', descriptor.visible, 'to', descriptor.name);
      this.set('visible', descriptor.visible);
    }
    if (descriptor.hasOwnProperty('attached')) {
      console.log('attaching to', descriptor.attached);
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
  ElementContainerMixin.createElement = createElement;

  ElementContainerMixin.addMethods = function (klass) {
    ChangeableListenable.addMethods(klass);
    lib.inherit(klass, ChangeableListenable);
    klass.prototype.set_visible = ElementContainerMixin.prototype.set_visible;
    klass.prototype.set_attached = ElementContainerMixin.prototype.set_attached;
    klass.prototype.elementNamed = ElementContainerMixin.prototype.elementNamed;
  }

  function produceAndAddElement (eb, desc) {
    var el = createElement(desc);
    if (el) {
      eb.elements.add(desc.name, el);
    }
  }

  function createElement(descriptor) {
    var dt, dn, ector;
    if (!descriptor) {
      throw new lib.Error('NO_PAGE_ELEMENT_DESCRIPTOR', 'No descriptor given to create a page element from');
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
      console.log('creating blessed', dt);
      return ector(descriptor.blessedoptions);
    }
    ector = blessedlib.elementRegistry.get(dt);
    if (lib.isFunction(ector)) {
      return new ector(descriptor);
    }
    throw new lib.JSONizingError('UNKNOWN_PAGE_ELEMENT_TYPE', descriptor, 'Could not recognize type');
  }

  function isEventSource(desc) {
    return desc && desc.source && desc.source.indexOf('!') > 0;
  }
  function isPropertySource(desc) {
    return desc && desc.source && desc.source.indexOf(':') > 0;
  }
  function isEventTarget(desc) {
    return desc && desc.target && desc.target.indexOf('!') > 0;
  }
  function isPropertyTarget(desc) {
    return desc && desc.target && desc.target.indexOf(':') > 0;
  }
  function instanceFromString (eb, str) {
    return str === '.' ? eb : eb.elements.get(str);
  }
  function parsedEventString(eb, desc, sourcedelim, targetdelim) {
    var sa = desc.source.split(sourcedelim),
      ta = desc.target.split(targetdelim),
      s, t;
    console.log('source', sa, 'target', ta);
    if (sa.length === 2 && ta.length===2) {
      s = instanceFromString(eb, sa[0]);
      t = instanceFromString(eb, ta[0]);
      if (s && t) {
        return {
          s: s,
          sr: sa[1],
          t: t,
          tr: ta[1]
        };
      } else {
        if (!s) {
          console.error('source could not be found from', sa[0]);
        }
        if (!t) {
          console.error('target could not be found from', ta[0]);
        }
      }
    }
    return null;
  }
  function addLink(be, name, l) {
    var ol;
    name = name || lib.uid();
    ol = be.links.replace(name, l));
    if (ol) {
      console.log('there was already a listener at ', name);
      ol.destroy();
    }
  }
  function produceEvent2PropertyLink (eb, desc) {
    var pes = parsedEventString(eb, desc, '!', ':'), name;
    if (pes) {
      addLink(be, desc.name, pes.s.attachListener(pes.sr, pes.t.set.bind(pes.t, pes.tr));
    }
  }
  function produceProperty2PropertyLink (eb, desc) {
    var pes = parsedEventString(eb, desc, ':', ':'), name;
    if (pes) {
      addLink(be, desc.name, pes.s.attachListener(pes.sr, pes.t.set.bind(pes.t, pes.tr));
    }
  }
  function produceLink (eb, desc) {
    if (!desc) {
      throw new lib.Error('NO_LINK_DESCRIPTOR', 'No link descriptor');
    }
    if (!desc.source) {
      throw new lib.JSONizingError('NO_SOURCE_IN_LINK_DESCRIPTOR', desc, 'No source in');
    }
    if (!desc.target) {
      throw new lib.JSONizingError('NO_TARGET_IN_LINK_DESCRIPTOR', desc, 'No target in');
    }
    if (isEventSource(desc)) {
      if (isPropertyTarget(desc)) {
        produceEvent2PropertyLink(eb, desc);
        return;
      }
      if (isEventTarget(desc)) {
        produceEvent2EventLink(eb, desc);
      }
    }
    if (isPropertySource(desc)) {
      if (isPropertyTarget(desc)) {
        produceProperty2PropertyLink(eb, desc);
        return;
      }
      if (isEventTarget(desc)) {
        produceProperty2EventLink(eb, desc);
      }
    }
  }

  return ElementContainerMixin;
}

module.exports = createElementContainerMixin;
