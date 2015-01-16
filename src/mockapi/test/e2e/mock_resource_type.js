describe('Hello teest', function() {
  it('Hello moondash!', function() {
    browser.get('src/mockapi/test/e2e/mock_resource_type/index.html');

    var hello = element(by.css('h1'));

    expect(hello.getText()).toEqual('Mock Resource Type');
  });

});

