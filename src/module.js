/*

 Declare the module with dependencies, and nothing more.

 If running in "development mode", inject the mock infrastructure.

 */

var dependencies = [
  'ngAnimate', 'ngMessages'
];

if (document.URL.indexOf(':9000') != -1) {
  dependencies.push('ngMockE2E');
  dependencies.push('moondashMock');
}
angular.module('moondash', dependencies)
  .value('mockRest', {});
