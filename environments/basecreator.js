function createBlessedEnvironmentBase (execlib, blessedlib) {
  'use strict';

  var lib = execlib.lib,
    BlessedPage = require('./pagecreator')(execlib, blessedlib),
    ElementBase = blessedlib.ElementBase,
    ChangeableListenable = lib.ChangeableListenable;
  
  function DataSource () {
    ChangeableListenable.call(this);
    this.data = null;
  }
  ChangeableListenable.addMethods(DataSource);
  lib.inherit(DataSource, ChangeableListenable);
  DataSource.prototype.destroy = function () {
    this.data = null;
    ChangeableListenable.prototype.destroy.call(this);
  };
  DataSource.prototype.set_data = function (val) {
    this.data = val;
    return true;
  }

  function menuProducer(be, pages) {
    var ret = {};
    pages.forEach(be.addPage.bind(be, ret));
    return ret;
  }

  function elementDecorator (result, desc) {
    if (desc.menu) {
      result++;
      desc.type = 'container';
      desc.visible = false;
    }
    return result;
  }

  function getOrCreator (map, name) {
    var e = map.get(name);
    if (!e) {
      e = new DataSource();
      map.add(name, e);
    }
    return e;
  };

  function BlessedEnvironment (descriptor) {
    this.environment = descriptor.environment;
    if (lib.isArray(descriptor.elements)) {
      if (descriptor.elements.reduce(elementDecorator, 0)) {
        descriptor.elements = descriptor.elements.concat( [{
          type: 'listbar',
          name: 'menu',
          blessedoptions: {
            top: 0,
            height:1,
            left: 3,
            right: 3,
            mouse: true,
            items: menuProducer(this, descriptor.elements),
            autoCommandKeys: true
          }
        },{
          type: 'box',
          name: 'area',
          blessedoptions: {
            bottom:1,
            left:0,
            right:0,
            top:1
          }
        },{
          type: 'box',
          name: 'statusbar',
          blessedoptions: {
            bottom: 0,
            height: 1,
            left: 0,
            right: 0,
            style: {
              bg: '#000040'
            }
          }
        }]);
      } else {
        descriptor.elements = descriptor.elements.concat([{
          type: 'box',
          name: 'area',
          blessedoptions: {
            bottom:1,
            left:0,
            right:0,
            top:0
          }
        },{
          type: 'box',
          name: 'statusbar',
          blessedoptions: {
            bottom: 0,
            height: 1,
            left: 0,
            right: 0,
            style: {
              bg: '#000040'
            }
          }
        }]);
      }
    }
    this.dataSources = new lib.Map();
    this.dataSources.getElement = getOrCreator.bind(null, this.dataSources);
    ElementBase.call(this, descriptor);
    this.state = null;
    this.commands = new lib.Map();
    this.activepage = null;
    this.environmentStateListener = descriptor.environment.attachListener('state', this.onEnvironmentState.bind(this, descriptor.environment));
  }
  lib.inherit(BlessedEnvironment, ElementBase);
  BlessedEnvironment.prototype.destroy = function () {
    if (this.environmentStateListener) {
      this.environmentStateListener.destroy();
    }
    this.environmentStateListener = null;
    this.activepage = null;
    if (this.commands) {
      this.commands.destroy();
    }
    this.commands = null;
    this.state = null;
    ElementBase.prototype.destroy.call(this);
    if (this.dataSources) {
      this.dataSources.getElement = null;
      this.dataSources.destroy();
    }
    this.dataSources = null;
    this.environment = null;
  };
  BlessedEnvironment.prototype.getElement = function (elementpath) {
    if (elementpath === '^') {
      return this.environment;
    }
    if (elementpath === 'dataSources') {
      return this.dataSources;
    }
    return ElementBase.prototype.getElement.call(this, elementpath);
  };
  BlessedEnvironment.prototype.addPage = function (menuhash, descriptor) {
    if (!descriptor) {
      return;
    }
    if (!descriptor.menu) {
      return;
    }
    if (!descriptor.name) {
      throw new lib.JSONizingError('NO_NAME_IN_PAGE_DESCRIPTOR', descriptor, 'No name');
    }
    menuhash[descriptor.menu] = {callback: this.activatePage.bind(this, descriptor.name)};
  };
  BlessedEnvironment.prototype.activatePage = function (pagename) {
    var p = this.elements.get(pagename);
    if (p && p !== this.activepage) {
      if (this.activepage) {
        this.activepage.set('visible', false);
        this.activepage.set('attached', null);
      }
      p.set('attached', this.elements.get('area'));
      p.set('visible', true);
      this.activepage = p;
    }
  };
  BlessedEnvironment.prototype.onEnvironmentState = function (environment, state) {
    if (state === 'established') {
      environment.dataSources.traverse(this.addDataSource.bind(this));
    }
    this.set('state', state);
  };
  BlessedEnvironment.prototype.addDataSource = function (envdatasource, name) {
    var ds = this.dataSources.get(name);
    if (!ds) {
      ds = new DataSource();
      this.dataSources.add(name, ds);
    }
    envdatasource.setTarget(ds);
  };
  BlessedEnvironment.prototype.defaultElementCreationOptions = {
    type: 'box'
  };

  return BlessedEnvironment;
}

module.exports = createBlessedEnvironmentBase;
