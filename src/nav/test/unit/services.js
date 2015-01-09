'use strict';

var
  services = require('../../services'),
  helper = require('../../../common/test-helper'),
  expect = helper.expect,
  spy = helper.spy,
  stub = helper.stub;


describe('Nav Service Setup', function () {

  var NavService = services.NavService;

  it('should have basic API', function () {
    var ns = new NavService();
    expect(ns.menus).to.be.a('object');
    expect(ns.addMenu).to.be.a('function');
    expect(ns.init).to.be.a('function');
  });

  it('should create a default root menu with no label', function () {
    var ns = new NavService();
    expect(ns.menus.root.label).to.equal(false);
    expect(ns.menus.root.priority).to.equal(-1);
    expect(ns.menus.root.items).to.be.empty();
  });

  it('should add a menu with no priority', function () {
    var ns = new NavService();
    ns.addMenu('someMenu', 'Some Menu');
    expect(ns.menus['someMenu'].label).to.equal('Some Menu');
    expect(ns.menus['someMenu'].priority).to.equal(99);
  });

  it('should add a menu with a priority', function () {
    var ns = new NavService();
    ns.addMenu('someMenu', 'Some Menu', 9);
    expect(ns.menus['someMenu'].label).to.equal('Some Menu');
    expect(ns.menus['someMenu'].priority).to.equal(9);
  });

  it('should return a NavMenu instance', function () {
    var ns = new NavService();
    var nm = ns.addMenu('someMenu', 'Some Menu', 9);
    expect(nm.addMenuItem).to.be.a('function');
  });

});

describe('Nav Menu Objects', function () {

  var NavMenu = services.NavMenu;

  it('should have passed in values set correctly', function () {
    var nm = new NavMenu('someId', 'someLabel', 9);
    expect(nm.id).to.equal('someId');
    expect(nm.label).to.equal('someLabel');
    expect(nm.priority).to.equal(9);
  });

  it('should set missing priority to a default', function () {
    var nm = new NavMenu('someId', 'someLabel');
    expect(nm.id).to.equal('someId');
    expect(nm.label).to.equal('someLabel');
    expect(nm.priority).to.equal(99);
  });

});