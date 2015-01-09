'use strict';

var
  helper = require('../../../common/test-helper'),
  expect = helper.expect,
  spy = helper.spy,
  stub = helper.stub,
  MockRest = require('../../providers').MockRest,
  Dispatcher = require('../../providers').Dispatcher;

describe('MockRest Provider Basics', function () {

  var mr;

  beforeEach(function () {
    mr = new MockRest();
  });

  it('should have basic api', function () {
    expect(mr.mocks).to.be.empty();
    expect(mr.mocks).to.be.a('array');
    expect(mr.$get).to.exist();
    expect(mr.addMocks).to.exist();
  });

  it('should have a $get instantiator for Angular', function () {
    expect(mr.$get().registerMocks).to.be.a('function');
  });

  it('should have add mocks', function () {
    mr.addMocks([{id: 1}]);
    expect(mr.mocks[0].id).to.equal(1);
  });

});

describe('MockRest Dispatcher', function () {

  var method, data, headers, result, mock, thisUrl, response;

  beforeEach(function () {
    method = 'GET';
    mock = {pattern: 'pattern'};
    thisUrl = '/foo?arg1=val1';
  });

  it('should return data and 200 for simplified mock', function () {
    mock = {responseData: [1, 2, 3]};
    result = Dispatcher(mock);
    expect(result[0]).to.equal(200);
    expect(result[1][0]).to.equal(1);
  });

  it('should return 401 when mock wants authorization not present', function () {
    headers = {};
    mock = {responseData: [1, 2, 3], authenticate: true};
    result = Dispatcher(mock, method, thisUrl, data, headers);
    expect(result[0]).to.equal(401);
    expect(result[1][0]).to.be.undefined();
  });

  it('should return 200 when mock wants authorization and present', function () {
    headers = {Authorization: 'xxx'};
    mock = {responseData: [1, 2, 3], authenticate: true};
    result = Dispatcher(mock, method, thisUrl, data, headers);
    expect(result[0]).to.equal(200);
    expect(result[1][0]).to.equal(1);
  });

  it('should call a responder with complete request data', function () {
    data = '{"flag": 9}';
    var responder = function (request) {
      return [200, request];
    };
    mock = {responder: responder};
    result = Dispatcher(mock, method, thisUrl, data, headers);
    response = result[1];
    expect(result[0]).to.equal(200);
    expect(response.url).to.equal(thisUrl);
    expect(response.headers.Authorization).to.equal('xxx');
    expect(response.data).to.equal(data);
    expect(response.method).to.equal('GET');
    expect(response.json_body.flag).to.equal(9);
  });
});
