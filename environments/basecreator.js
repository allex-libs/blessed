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

  function menuProducer(be, pages) {
    var ret = {};
    pages.forEach(be.addPage.bind(be, ret));
    return ret;
  }

  function elementDecorator (result, desc) {
    if (desc.menu === true) {
      result++;
      desc.type = 'container';
      desc.visible = false;
    }
    return result;
  }

  function BlessedEnvironment (descriptor) {
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
            bottom:0,
            left:0,
            right:0,
            top:1
          }
        }]);
      } else {
        descriptor.elements = descriptor.elements.concat([{
          type: 'box',
          name: 'area',
          blessedoptions: {
            bottom:0,
            left:0,
            right:0,
            top:0
          }
        }]);
      }
    }
    ElementBase.call(this, descriptor);
    this.state = null;
    this.dataSources = new lib.Map();
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
    if (this.dataSources) {
      this.dataSources.destroy();
    }
    this.dataSources = null;
    this.state = null;
    ElementBase.prototype.destroy.call(this);
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
    menuhash[descriptor.name] = {callback: this.activatePage.bind(this, descriptor.name)};
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
    } else{ 
      this.elements.dumpToConsole();
    }
  };
  BlessedEnvironment.prototype.onEnvironmentState = function (environment, state) {
    if (state === 'established') {
      environment.dataSources.traverse(this.addDataSource.bind(this));
    }
    this.set('state', state);
  };
  BlessedEnvironment.prototype.addDataSource = function (envdatasource, name) {
    var ds = new DataSource();
    envdatasource.setTarget(ds);
    this.dataSources.add(name, ds);
  };
  BlessedEnvironment.prototype.defaultElementCreationOptions = {
    type: 'box'
  };

  return BlessedEnvironment;
}

module.exports = createBlessedEnvironmentBase;
