var
  path = require('path'),
  baseUrl = require('./index').baseUrl;

describe('src/mockapi Test', function () {
  var url = path.join(baseUrl, 'collectionRead');

  beforeEach(function () {
    browser.get(url);
  });

  it('should get the test environment set correctly', function () {
    expect(browser.getTitle()).toEqual('E2E Test');
  });

  it('should GET collectionRead', function () {
    var count = element(by.id('e2e-prefix'));
    expect(count.getText()).toEqual('/api/resourcetypes');
  });

});

