describe('src/mockapi Test', function () {
  var url = 'src/mockapi/test/e2e/mock_resource_type/index.html#/';

  beforeEach(function () {
    browser.get(url);
  });

  it('should get the test environment set correctly', function () {
    var h1 = element(by.css('h1'));
    expect(h1.getText()).toEqual('Mock Resource Types');
  });

  it('should GET collectionREAD', function () {
    var value = element(by.id('collectionREAD-value'));
    expect(value.getText())
      .toEqual('{"prefix":"/api/resourcetypes","id":"invoices"}');
  });

  it('should GET collectionLIST', function () {
    var value = element(by.id('collectionLIST-value'));
    expect(value.getText())
      .toEqual('[{"id":"i1","title":"1"},{"id":"i2","title":"2"}]');
  });

});

