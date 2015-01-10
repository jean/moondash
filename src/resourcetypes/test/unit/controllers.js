'use strict';

var
  helper = require('../../../common/test-helper'),
  expect = helper.expect,
  spy = helper.spy,
  stub = helper.stub;

var
  controllers = require('../../controllers'),
  ctrl,
  result;

describe('ResourceTypes Manage Controller', function () {

  beforeEach(function () {
    ctrl = controllers.ManageController;
  });

  it('should save this.menus', function () {
    result = new ctrl();
    expect(result.flag).to.exist();
    expect(result.flag).to.equal(9);
  });

});

describe('ResourceTypes List Controller', function () {

  var $stateParams, items;

  beforeEach(function () {
    ctrl = controllers.ListController;
    $stateParams = {
      resourcetype: 9
    };
    items = 9;
  });

  it('should have a basic API', function () {
    result = new ctrl($stateParams, items);
    expect(result.resourcetype).to.equal(9);
    expect(result.items).to.equal(9);
  });

});

describe('ResourceTypes Edit Controller', function () {

  var item;

  beforeEach(function () {
    ctrl = controllers.EditController;
    item = 9;
  });

  it('should have a basic API', function () {
    result = new ctrl(item);
    expect(result.item).to.equal(9);
    expect(result.schemaId).to.equal('schema1');
    expect(result.formId).to.equal('form1');
  });

});
