function createAllexTable (execlib, ElementBase) {
  'use strict';

  var lib = execlib.lib;

  function BlessedAllexTable (descriptor) {
    ElementBase.call(this, descriptor);
    this.columns = descriptor.columns;
    this.columnfilters = descriptor.columnfilters;
    this.header = null;
    this.maybeSetHeader();
    this.data = null;
    this.selected = new lib.HookCollection();
    this.selector = this.onSelect.bind(this);
    this.blessed.on('select', this.selector);
  }
  lib.inherit(BlessedAllexTable, ElementBase);
  BlessedAllexTable.prototype.destroy = function () {
    if (this.selector) {
      this.blessed.removeListener('select', this.selector);
    }
    this.selector = null;
    if (this.selected) {
      this.selected.destroy();
    }
    this.selected = null;
    this.data = null;
    this.header = null;
    this.columnfilters = null;
    this.columns = null;
    ElementBase.prototype.destroy.call(this);
  };
  function addHeaderCell(bat, item) {
    bat.header.push(item.title);
  };
  BlessedAllexTable.prototype.maybeSetHeader = function () {
    if (this.columns) {
      this.header = [];
      this.columns.forEach(addHeaderCell.bind(null, this));
      this.blessed.setData([this.header]);
    }
  };
  function cellAppender(coldescs, columnfilters, row, item, itemname) {
    var cf;
    if (coldescs && !lib.arryOperations.findElementWithProperty(coldescs, 'name', itemname)) {
      return;
    }
    cf = columnfilters[itemname];
    if (cf) {
      item = cf(item, row);
    }
    if (item === null) {
      item = '';
    }
    if (lib.isArray(item)){
      item = item.join(',');
    }
    item = item.toString();
    row.push(item);
  }
  function hash2Row(coldescs, columnfilters, rows, hash) {
    var row = [];
    lib.traverseShallow(hash, cellAppender.bind(null, coldescs, columnfilters, row));
    rows.push(row);
    row = null;
  }
  BlessedAllexTable.prototype.set_data = function (val) {
    var rows;
    if (this.data === val) {
      return false;
    }
    this.data = val;
    if (!lib.isArray(val)) {
      return;
    }
    rows = [];
    val.forEach(hash2Row.bind(null, this.columns, this.columnfilters, rows));
    if (this.header) {
      rows.unshift(this.header);
    }
    this.blessed.setData(rows);
  };
  BlessedAllexTable.prototype.onSelect = function (blessed, rowindex) {
    if (this.header) {
      rowindex--;
    }
    if (rowindex<0) {
      return;
    }
    if (rowindex>this.data.length-1) {
      return;
    }
    this.selected.fire(this.data[rowindex]);
  };

  BlessedAllexTable.prototype.defaultElementCreationOptions = {
    type: 'listtable',
    blessedoptions: {
      style: {
        selected: {
          bg: 'blue'
        }
      }
    }
  };

  return BlessedAllexTable;
}

module.exports = createAllexTable;
