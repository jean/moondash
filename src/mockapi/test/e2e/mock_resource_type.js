describe('src/mockapi Test', function() {
  it('Test moondash!', function() {
    browser.get('src/mockapi/test/e2e/mock_resource_type/index.html');

    var hello = element(by.css('h1'));

    expect(hello.getText()).toEqual('mockapi tests');
  });

});

