describe('Hello teest', function() {
  it('Hello moondash!', function() {
    browser.get('src/hellotesting/test/e2e/hello/index.html');

    var hello = element(by.css('h1'));

    expect(hello.getText()).toEqual('Hello Moondash');
  });

});

