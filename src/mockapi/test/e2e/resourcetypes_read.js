var
  path = require('path'),
  baseUrl = require('./index').baseUrl;

describe('src/mockapi resourcetypesRead Test', function () {
  var url = path.join(baseUrl, 'read');

  beforeEach(function () {
    browser.get(url);
  });

  it('should get the test environment set correctly', function () {
    expect(browser.getTitle()).toEqual('E2E Test');
    var heading = element(by.id('e2e-testname'));
    expect(heading.getText()).toEqual('resourcetypes read');
  });

  it('should GET resourcetypesRead', function () {
    var invoicesId = element(by.binding('ctrl.resourceTypes.prefix'));
    expect(invoicesId.getText()).toEqual('/api/resourcetypes');
  });

});

