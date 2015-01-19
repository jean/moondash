var
  path = require('path'),
  baseUrl = require('./index').baseUrl;

describe('src/mockapi collectionAdd Test', function () {
  var url = path.join(baseUrl, 'invoices/add');

  beforeEach(function () {
    browser.get(url);
  });

  it('should get the test environment set correctly', function () {
    expect(browser.getTitle()).toEqual('E2E Test');
  });

  it('should fill in form and get new values', function () {
    element(by.model('ctrl.model.id')).sendKeys('newId');
    element(by.model('ctrl.model.title')).sendKeys('newTitle');
    element(by.id('gobutton')).click();
    var newItemId = element(by.id('e2e-id-newId'));
    expect(newItemId.getText()).toEqual('newId');
    var newItemTitle = element(by.id('e2e-title-newId'));
    expect(newItemTitle.getText()).toEqual('newTitle');
  });

});