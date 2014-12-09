// An example configuration file.
config = require('../gulp/config');

exports.config = {
  chromeDriver: '../node_modules/protractor/selenium/chromedriver',
  seleniumServerJar: '../node_modules/protractor/selenium/selenium-server-standalone-2.44.0.jar',

  // Spec patterns are relative to the current working directly when
  // protractor is called.
  specs: config.e2e.specs,

  baseUrl: 'http://localhost:3000/',

  // Options to be passed to Jasmine-node.
  jasmineNodeOpts: {
    showColors: true,
    includeStackTrace: true,
    defaultTimeoutInterval: 30000
  }
};
