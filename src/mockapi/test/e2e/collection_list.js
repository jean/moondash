describe('src/mockapi Test', function () {
  var url = 'src/mockapi/test/e2e/demo/index.html#/';

  beforeEach(function () {
    browser.get(url);
  });

  it('should get the test environment set correctly', function () {
    expect(browser.getTitle()).toEqual('E2E Test');
  });

  it('should GET collectionRead', function () {
    var value = element(by.id('collectionRead-value'));
    expect(value.getText())
      .toEqual('{"prefix":"/api/resourcetypes","id":"invoices"}');
  });

  fit('should GET collectionList', function () {
    var value = element(by.id('collectionList-value'));
    expect(value.getText())
      .toEqual('[{"id":"i1","title":"1"},{"id":"i2","title":"2"}]');
  });

});

