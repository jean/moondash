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
    addMenu: stub(),
    addMenuItem: stub()
  };

  it('should have basic API', function () {
    rtypes = new RTypesService(MdNav);
    expect(rtypes.urlPrefix).to.equal('api/rtypes');
    expect(rtypes.items).to.be.a('object');
    expect(rtypes.items).to.be.empty();
    expect(rtypes.add).to.be.a('function');
    expect(rtypes.init).to.be.a('function');
  });

});
