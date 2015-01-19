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

  var resourceType, items;

  beforeEach(function () {
    ctrl = controllers.ListController;
    resourceType = {id: 'invoices'};
    items = 9;
  });

  it('should have a basic API', function () {
    result = new ctrl(resourceType, items);
    expect(result.resourceType.id).to.equal('invoices');
    expect(result.items).to.equal(9);
    expect(result.deleteResource).to.be.a('function');
  });

});

describe('ResourceTypes View Controller', function () {

  var item;

  beforeEach(function () {
    ctrl = controllers.ResourceReadController;
    item = {
      plain: function () {
        return {
          id: 9
        }
      }
    };
  });

  it('should have a basic API', function () {
    result = new ctrl(item);
    expect(result.resource.id).to.equal(9);
  });

});

describe('ResourceTypes Edit Controller', function () {

  var item;

  beforeEach(function () {
    ctrl = controllers.ResourceEditController;
    item = 9;
  });

  it('should have a basic API', function () {
    result = new ctrl(item);
    expect(result.item).to.equal(9);
    expect(result.schemaId).to.equal('schema1');
    expect(result.formId).to.equal('form1');
  });

});
