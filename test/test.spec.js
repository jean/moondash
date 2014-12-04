var hellotesting = require('../src/hellotesting');
describe('tests', function() {
    it('dummy test', function() {
        expect(hellotesting).toBe('Hello world!');
    });
});
