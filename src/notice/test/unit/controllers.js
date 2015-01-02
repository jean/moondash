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

describe('Notice Notice Controller', function () {

  var $scope, $modalInstance, $timeout, message;

  beforeEach(function () {
    ctrl = controllers.NoticeController;
    $scope = {
      $on: stub()
    };
    message = 9;
    $timeout = stub();
  });

  it('should have a basic API', function () {
    result = new ctrl($scope, $modalInstance, $timeout, message);
    expect(result.message).to.exist();
    expect(result.message).to.equal(9);
  });

});
