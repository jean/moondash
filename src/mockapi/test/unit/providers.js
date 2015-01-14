'use strict';

var
  helper = require('../../../common/test-helper'),
  expect = helper.expect,
  spy = helper.spy,
  stub = helper.stub;

describe('mockapi MockRest', function () {

  var
    providers = require('../../providers'),
    MockRest = providers.MockRest,
    Dispatcher = providers.Dispatcher,
    exceptions = require('../../exceptions');

  describe('Provider Basics', function () {

    var mr;

    beforeEach(function () {
      mr = new MockRest();
    });

    it('should have basic api', function () {
      expect(mr.mocks).to.be.empty();
      expect(mr.mocks).to.be.a('array');
      expect(mr.$get).to.exist();
      expect(mr.addMocks).to.exist();
      expect(mr.exceptions.HTTPNotFound).to.exist();
    });

    it('should have a $get instantiator for Angular', function () {
      expect(mr.$get().registerMocks).to.be.a('function');
    });

    it('should have add mocks', function () {
      mr.addMocks([{id: 1}]);
      expect(mr.mocks[0].id).to.equal(1);
    });

  });

  describe('Dispatcher', function () {

    var method, data, headers, result, mock, thisUrl, responseCode, responseBody;

    beforeEach(function () {
      method = 'GET';
      mock = {pattern: 'pattern'};
      thisUrl = '/foo?arg1=val1';
    });

    it('should return data and 200 for simplified mock', function () {
      mock = {responseData: [1, 2, 3]};
      result = Dispatcher(mock);
      responseCode = result[0];
      responseBody = result[1];
      expect(responseCode).to.equal(200);
      expect(responseBody[0]).to.equal(1);
    });

    it('should return 401 when mock wants authorization not present', function () {
      headers = {};
      mock = {responseData: [1, 2, 3], authenticate: true};
      result = Dispatcher(mock, method, thisUrl, data, headers);
      responseCode = result[0];
      responseBody = result[1];
      expect(responseCode).to.equal(401);
      expect(responseBody.message).to.equal('Login required')
    });

    it('should return 200 when mock wants authorization and present', function () {
      headers = {Authorization: 'xxx'};
      mock = {responseData: [1, 2, 3], authenticate: true};
      result = Dispatcher(mock, method, thisUrl, data, headers);
      responseCode = result[0];
      responseBody = result[1];
      expect(responseCode).to.equal(200);
      expect(responseBody[0]).to.equal(1);
    });

    it('should call a responder with complete request data', function () {
      data = '{"flag": 9}';
      var responder = function (request) {
        return request;
      };
      mock = {responder: responder};
      result = Dispatcher(mock, method, thisUrl, data, headers);
      responseCode = result[0];
      responseBody = result[1];
      expect(result[0]).to.equal(200);
      expect(responseBody.url).to.equal(thisUrl);
      expect(responseBody.headers.Authorization).to.equal('xxx');
      expect(responseBody.data).to.equal(data);
      expect(responseBody.method).to.equal('GET');
      expect(responseBody.json_body.flag).to.equal(9);
    });

    it('should handle a raised HTTPNotFound', function () {
      var responder = function () {
        throw new exceptions.HTTPNotFound('some message');
      };
      mock = {responder: responder};
      result = Dispatcher(mock, method, thisUrl, data, headers);
      responseCode = result[0];
      responseBody = result[1];
      expect(responseCode).to.equal(404);
      expect(responseBody.message).to.equal('some message');
    });

    it('should handle a raised unauthorized', function () {
      var responder = function () {
        throw new exceptions.HTTPUnauthorized('some message');
      };
      mock = {responder: responder};
      result = Dispatcher(mock, method, thisUrl, data, headers);
      responseCode = result[0];
      responseBody = result[1];
      expect(responseCode).to.equal(401);
      expect(responseBody.message).to.equal('some message');
    });

    it('should handle a raised no content', function () {
      var responder = function () {
        throw new exceptions.HTTPNoContent();
      };
      mock = {responder: responder};
      result = Dispatcher(mock, method, thisUrl, data, headers);
      responseCode = result[0];
      responseBody = result[1];
      expect(responseCode).to.equal(204);
      expect(responseBody).to.be.null();
    });

  });

});
