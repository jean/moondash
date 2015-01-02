'use strict';

var
  helper = require('../../../common/test-helper'),
  expect = helper.expect,
  spy = helper.spy,
  stub = helper.stub;

var
  providers = require('../../providers'),
  provider,
  result;

describe('Forms Form Controller', function () {

  beforeEach(function () {
    provider = providers.MockRest;
  });

  it('should have basic api', function () {
    result = new provider();
    expect(result.mocks).to.be.empty();
    expect(result.mocks).to.be.a('object');
    expect(result.$get).to.exist();
    expect(result.addMocks).to.exist();
  });

});
