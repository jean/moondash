'use strict';

var _ = require('lodash');
var url = require('url');

function Dispatcher(mock, method, thisUrl, data, headers) {
  // Called by $httpBackend whenever this mock's pattern is matched.

  var responder, responseData, response, request, parsedUrl;

  // If the mock says to authenticate and we don't have
  // an Authorization header, return 401.
  if (mock.authenticate) {
    var authz = headers['Authorization'];
    if (!authz) {
      return [401, {'message': 'Login required'}];
    }
  }

  responder = mock.responder;
  responseData = mock.responseData;

  // A generic responder for handling the case where the
  // mock just wanted the basics and supplied responseData
  if (responseData) {
    response = [200, responseData]
  } else {
    // Package up request information into a convenient data,
    // call the responder, and return the response.
    request = url.parse(thisUrl, true);
    request.url = thisUrl;
    request.headers = headers;
    request.data = data;
    if (data) request.json_body = JSON.parse(data);
    response = responder(request);
  }

  return response;
}

function MockRest() {
  var _this = this;
  this.mocks = [];

  this.$get = function () {
    var mocks = this.mocks;
    return {
      registerMocks: registerMocks
    };
  };

  this.addMocks = function (mocks) {
    this.mocks = this.mocks.concat(mocks);
  };

  function registerMocks($httpBackend) {
    // Iterate over all the registered mocks and register them
    _(_this.mocks).forEach(function (mock) {

      // To register with $httpBackend's matchers, we need two things
      // from the mock: the method and the URL pattern.
      var method = mock.method || 'GET',
        pattern = mock.pattern;

      var wrappedResponder = function (method, url, data, headers) {
        return Dispatcher(mock, method, url, data, headers);
      };

      $httpBackend.when(method, pattern)
        .respond(wrappedResponder);
    });
  }

}


function ModuleRun($httpBackend, MdMockRest) {
  MdMockRest.registerMocks($httpBackend);

  // pass through everything else
  $httpBackend.whenGET(/\/*/).passThrough();
  $httpBackend.whenPOST(/\/*/).passThrough();
  $httpBackend.whenPUT(/\/*/).passThrough();
  $httpBackend.whenPATCH(/\/*/).passThrough();

}


module.exports = {
  MockRest: MockRest,
  Run: ModuleRun,
  Dispatcher: Dispatcher
};
