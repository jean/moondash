var
  path = require('path'),
  baseUrl = require('./index').baseUrl;

describe('src/mockapi documentUpdate Test', function () {
  var url = path.join(baseUrl, 'i1/update');

  beforeEach(function () {
    browser.get(url);
  });

  it('should get the test environment set correctly', function () {
    expect(browser.getTitle()).toEqual('E2E Test');
  });

  it('should fill in form and get new values', function () {
    element(by.model('ctrl.invoice.title')).sendKeys('newTitle');
    element(by.id('gobutton')).click();
    var newItemTitle = element(by.binding('ctrl.invoice.title'));
    expect(newItemTitle.getText()).toEqual('1newTitle');
  });

});