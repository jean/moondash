'use strict';

var
  helper = require('../../../common/test-helper'),
  expect = helper.expect,
  spy = helper.spy,
  stub = helper.stub,
  MockRest = require('../../providers').MockRest;

describe('MockRest Provider', function () {

  var mr;

  beforeEach(function () {
    mr = new MockRest();
  });

  it('should have basic api', function () {
    expect(mr.mocks).to.be.empty();
    expect(mr.mocks).to.be.a('object');
    expect(mr.$get).to.exist();
    expect(mr.addMocks).to.exist();
  });

  it('should have a $get instantiator for Angular', function () {
    expect(mr.$get().registerMocks).to.be.a('function');
  });

  it('should have add mocks', function () {
    mr.addMocks('someMocks', [{id: 1}]);
    expect(mr.mocks['someMocks'][0].id).to.equal(1);
  });

  it('should register some mocks', function () {

  });

});
