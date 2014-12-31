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

describe('Dispatch NotFound Controller', function () {

  var LocationService = {
    path: function () {
      return 9;
    }
  };

  beforeEach(function () {
    ctrl = controllers.NotFoundCtrl;
  });

  it('should have path', function () {
    result = new ctrl(LocationService);
    expect(result.path).to.equal(9);
  });

});

describe('Dispatch ErrorFound Controller', function () {

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

describe('Dispatch DispatcherCtrl Controller', function () {

  var $state, MdDispatcher;
  var resolvedPath = {
    data: {
      context: {},
      viewName: null,
      parents: []
    }
  };


  beforeEach(function () {
    $state = {
      go: function () {
      }
    };
    MdDispatcher = {
      resolveState: spy()
    };
    ctrl = controllers.DispatcherCtrl;
  });

  after(function () {
    $state.go.restore();
  });

  it('should go to notfound on resolvedPath error', function () {
    resolvedPath.error = true;
    var $stateSpy = spy($state, 'go');
    result = new ctrl($state, resolvedPath, MdDispatcher);
    expect($stateSpy.called).to.be.true();
    expect($stateSpy.calledWith('notfound')).to.be.true();
    // Make sure we bailed out before setting MdDispatcher
    expect(MdDispatcher.context).to.be.undefined();
  });

  it('should notfound on resolvedPath without error but not match', function () {
    resolvedPath.error = false;
    var $stateSpy = spy($state, 'go');
    result = new ctrl($state, resolvedPath, MdDispatcher);
    expect($stateSpy.calledWith('notfound')).to.be.true();
    expect(MdDispatcher.context).to.be.empty();
  });

});
