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

describe('NotFound Login Controller', function () {

  var LocationService = {
    path: function () {return 9;}
  };

  beforeEach(function () {
    ctrl = controllers.NotFoundCtrl;
  });

  it('should have path', function () {
    result = new ctrl(LocationService);
    expect(result.path).to.equal(9);
  });

});

describe('ErrorFound Login Controller', function () {

  beforeEach(function () {
    ctrl = controllers.ErrorCtrl;
  });

  it('should have toState and error', function () {
    var stateParams = {toState: 9, error: 9};
    result = new ctrl(stateParams);
    expect(result.toState).to.equal(9);
    expect(result.error).to.equal(9);
  });

});
