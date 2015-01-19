var
  path = require('path'),
  baseUrl = require('./index').baseUrl;

describe('src/mockapi documentRead Test', function () {
  var url = path.join(baseUrl, 'invoices/i1/read');

  beforeEach(function () {
    browser.get(url);
  });

  it('should get the test environment set correctly', function () {
    expect(browser.getTitle()).toEqual('E2E Test');
  });

  it('should GET documentRead', function () {
    var invoiceId = element(by.binding('ctrl.invoice.id'));
    expect(invoiceId.getText()).toEqual('i1');
    var invoiceTitle = element(by.binding('ctrl.invoice.title'));
    expect(invoiceTitle.getText()).toEqual('1');
  });

});

