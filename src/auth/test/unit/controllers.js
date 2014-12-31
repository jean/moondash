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

function Then() {
  return {
    then: function (f) {
      f();
      return {
        'catch': function () {}
      }
    }
  }
}

var AuthService = {
  login: Then,
  logout: Then
};

var NoticeService = {
  show: function () {}
};

describe('Auth Login Controller', function () {

  beforeEach(function () {
    ctrl = controllers.LoginCtrl;
  });

  it('should have login method and default errorMessaage', function () {
    result = new ctrl(AuthService, NoticeService);
    expect(result.login).to.exist();
    expect(result.errorMessage).to.equal(false);
  });

  it('should have login method that calls auth', function () {
    result = new ctrl(AuthService, NoticeService);
    var authLoginSpy = spy(result, 'login');
    // Temporarily set the error message
    result.errorMessage = 'temporary';
    result.login();
    expect(result.errorMessage).to.equal(false);
    expect(authLoginSpy.called).to.be.true();
  });

});

describe('Auth Logout Controller', function () {

  beforeEach(function () {
    ctrl = controllers.LogoutCtrl;
  });

  it('should have logout method and default errorMessaage', function () {
    var authLogoutSpy = spy(AuthService, 'logout');
    result = new ctrl(AuthService, NoticeService);
    expect(authLogoutSpy.called).to.be.true();
  });

});

describe('Auth Profile Controller', function () {

  beforeEach(function () {
    ctrl = controllers.ProfileCtrl;
  });

  it('should have logout method and default errorMessaage', function () {
    var profile = true;
    result = new ctrl(profile);
    expect(result.profile).to.equal(true);
  });

});
