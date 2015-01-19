var
  path = require('path'),
  baseUrl = require('./index').baseUrl;

describe('src/mockapi collectionRead Test', function () {
  var url = path.join(baseUrl, 'invoices/read');

  beforeEach(function () {
    browser.get(url);
  });

  it('should get the test environment set correctly', function () {
    expect(browser.getTitle()).toEqual('E2E Test');
  });

  it('should GET collectionRead', function () {
    var invoicesId = element(by.binding('ctrl.invoices.id'));
    expect(invoicesId.getText()).toEqual('invoices');
  });

});

