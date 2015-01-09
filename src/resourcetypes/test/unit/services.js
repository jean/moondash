'use strict';

var
  RTypesService = require('../../services').RTypesService,
  rtypes,
  helper = require('../../../common/test-helper'),
  expect = helper.expect,
  spy = helper.spy,
  stub = helper.stub;


describe('ResourceTypes RTypes Service Setup', function () {

  var MdNav = {
    addMenu: stub().returns({addMenuItem: stub()})
  };

  it('should have basic API', function () {
    rtypes = new RTypesService(MdNav);
    expect(rtypes.urlPrefix).to.equal('api/rtypes');
    expect(rtypes.items).to.be.a('object');
    expect(rtypes.items).to.be.empty();
    expect(rtypes.init).to.be.a('function');
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
    rtypes = new RTypesService(MdNav);
    rtypes.init(init);
    expect(menuItems['invoices'].id).to.equal('invoices');
  });

});
