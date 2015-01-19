var
  path = require('path'),
  baseUrl = require('./index').baseUrl;

describe('src/mockapi collectionList Test', function () {
  var url = path.join(baseUrl, 'list');

  beforeEach(function () {
    browser.get(url);
  });

  it('should get the test environment set correctly', function () {
    expect(browser.getTitle()).toEqual('E2E Test');
  });

  it('should GET collectionList', function () {
    var count = element(by.id('e2e-count'));
    expect(count.getText()).toEqual('2');
  });

});

