var
  path = require('path'),
  baseUrl = require('./index').baseUrl;

describe('src/mockapi resourcetypesAdd Test', function () {
  var url = path.join(baseUrl, 'add');

  beforeEach(function () {
    browser.get(url);
  });

  it('should get the test environment set correctly', function () {
    expect(browser.getTitle()).toEqual('E2E Test');
    var heading = element(by.id('e2e-testname'));
    expect(heading.getText()).toEqual('resourcetypes add');
  });

  it('should fill in form and get new values', function () {
    element(by.model('ctrl.model.id')).sendKeys('newId');
    element(by.id('gobutton')).click();
    var newItemId = element(by.id('e2e-id-newId'));
    expect(newItemId.getText()).toEqual('newId');
  });

});