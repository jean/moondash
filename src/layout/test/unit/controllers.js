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

describe('Layout Layout Controller', function () {

  var $rootScope, MdLayout;

  beforeEach(function () {
    ctrl = controllers.LayoutController;
    $rootScope = {};
    MdLayout = {flag: 9};
  });

  it('should have assign layout to root scope', function () {
    ctrl($rootScope, MdLayout);
    expect($rootScope.layout.flag).to.equal(9);
  });

});

describe('Layout Header Controller', function () {

  var MdConfig, $auth;

  beforeEach(function () {
    ctrl = controllers.HeaderController;
    MdConfig = {
      site: {
        name: 9
      }
    };
    $auth = {flag: 9};
  });

  it('should assign $auth and siteName', function () {
    result = new ctrl(MdConfig, $auth);
    expect(result.$auth.flag).to.equal(9);
    expect(result.siteName).to.equal(9);
  });

});

describe('Layout Footer Controller', function () {

  var MdConfig;

  beforeEach(function () {
    ctrl = controllers.FooterController;
    MdConfig = {
      site: {
        name: 9
      }
    };
  });

  it('should assign siteName', function () {
    result = new ctrl(MdConfig);
    expect(result.siteName).to.equal(9);
  });
});

describe('Layout Nav Controller', function () {

  beforeEach(function () {
    ctrl = controllers.NavController;
  });

  it('should be called', function () {
    result = new ctrl();
    expect(result).to.be.empty();
  });

});

