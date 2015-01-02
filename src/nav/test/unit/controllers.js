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

describe('Nav NavPanel Controller', function () {

  var MdNav;

  beforeEach(function () {
    ctrl = controllers.NavPanelController;
    MdNav = {menus: {flag: 9}};
  });

  it('should save this.menus', function () {
    result = new ctrl(MdNav);
    expect(result.menus).to.exist();
    expect(result.menus).to.be.a('object');
    expect(result.menus.flag).to.equal(9);
  });

});

describe('Nav NavMenu Controller', function () {

  beforeEach(function () {
    ctrl = controllers.NavMenuController;
  });

  it('should save this.menus', function () {
    result = new ctrl();
    expect(result.sref).to.exist();
    expect(result.sref).to.be.a('function');
  });

  it('should set uiSref with someparams', function () {
    result = new ctrl();
    var menuitem = {
      state: 'some-state',
      params: 'someparam:9'
    };
    var uiSref = result.sref(menuitem);
    expect(uiSref).to.equal('some-state({someparam:9})');
  });

  it('should set uiSref without someparams', function () {
    result = new ctrl();
    var menuitem = {
      state: 'some-state'
    };
    var uiSref = result.sref(menuitem);
    expect(uiSref).to.equal('some-state');
  });

});

describe('Nav NavSubmenu Controller', function () {

  beforeEach(function () {
    ctrl = controllers.NavSubmenuController;
  });

  it('should set isCollapsed to true', function () {
    result = new ctrl();
    expect(result.isCollapsed).to.exist();
    expect(result.isCollapsed).to.be.true();
  });

});
