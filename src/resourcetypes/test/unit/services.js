'use strict';

var
  RTypesService = require('../../services').RTypesService,
  resourcetypes,
  helper = require('../../../common/test-helper'),
  expect = helper.expect,
  spy = helper.spy,
  stub = helper.stub;


describe('ResourceTypes RTypes Service Setup', function () {

  var MdNav = {
    addMenu: stub().returns({addMenuItem: stub()})
  };

  it('should have basic API', function () {
    resourcetypes = new RTypesService(MdNav);
    expect(resourcetypes.urlPrefix).to.equal('api/resourcetypes');
    expect(resourcetypes.items).to.be.a('object');
    expect(resourcetypes.items).to.be.empty();
    expect(resourcetypes.init).to.be.a('function');
  });

});

describe('ResourceTypes RTypes Service Init', function () {
  var menuItems = {};

  var MdNav = {
    addMenu: stub()
      .returns(
      {
        addMenuItem: function (menuItem) {
          menuItems[menuItem.id] = menuItem;
        }
      })
  };

  it('should have basic API', function () {
    var init = {
      'items': {
        'invoices': {
          'id': 'invoices',
          'label': 'Invoices'
        }
      }
    };
    resourcetypes = new RTypesService(MdNav);
    resourcetypes.init(init);
    expect(menuItems['invoices'].id).to.equal('invoices');
  });

});
