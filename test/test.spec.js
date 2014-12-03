var module = require('../src/module.js');
describe('tests', function() {
    it('dummy test', function() {
        expect(module.dependencies).toBe(['ui-router']);
    });
});
