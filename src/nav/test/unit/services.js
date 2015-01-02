'use strict';

var
  NavService = require('../../services').NavService,
  nav,
  helper = require('../../../common/test-helper'),
  expect = helper.expect,
  spy = helper.spy,
  stub = helper.stub;


describe('Nav Service Setup', function () {

  beforeEach(function () {
  });

  it('should have basic API', function () {
    nav = new NavService();
    expect(nav.menus).to.be.a('object');
    expect(nav.addMenu).to.be.a('function');
    expect(nav.addMenuItem).to.be.a('function');
    expect(nav.init).to.be.a('function');
  });

});
