describe('Hello teest', function() {
  it('Hello moondash!', function() {
    browser.get('src/common/test/e2e/filter/index.html');

    var hello = element(by.css('h1'));

    expect(hello.getText()).toEqual('Hello Moondash');
  });

});

