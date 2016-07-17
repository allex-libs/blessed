function createAllexTable (execlib, ElementBase) {
  'use strict';

  var lib = execlib.lib;

  function BlessedAllexTable (descriptor) {
    ElementBase.call(this, descriptor);
    this.columns = descriptor.columns;
    this.columnfilters = descriptor.columnfilters;
    this.header = null;
    this.maybeSetHeader();
  }
  lib.inherit(BlessedAllexTable, ElementBase);
  BlessedAllexTable.prototype.destroy = function () {
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
