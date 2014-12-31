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

describe('Auth Login Controller', function () {

  var AuthService;

  beforeEach(function () {
    ctrl = controllers.LoginCtrl;
    AuthService = {
      getTodos: stub().returns([{}]),
      create: spy(),
      insert: spy(),
      remove: spy()
    };
  });

  it('should have login method and default errorMessaage', function () {
    result = new ctrl();
    expect(result.login).to.exist();
    expect(result.errorMessage).to.equal(false);
  });


  it('should have login method that calls auth', function () {
    result = new ctrl();
  });

});
