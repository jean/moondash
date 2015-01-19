var
  path = require('path'),
  baseUrl = require('./index').baseUrl;

describe('src/mockapi documentDelete Test', function () {
  var url = path.join(baseUrl, 'invoices/i1/delete');

  beforeEach(function () {
    browser.get(url);
  });

  it('should get the test environment set correctly', function () {
    expect(browser.getTitle()).toEqual('E2E Test');
  });

  it('should click delete and show removal from list', function () {
    element(by.id('gobutton')).click();
    var removedItemId = element(by.id('e2e-id-i1'));
    expect(element(by.id('e2e-id-i1')).isPresent()).toBe(false);
  });

});