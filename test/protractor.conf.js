// An example configuration file.
config = require('../gulp/config');

exports.config = {
  seleniumServerJar: '../node_modules/protractor/selenium/selenium-server-standalone-2.43.1.jar',

  // Capabilities to be passed to the webdriver instance.
  capabilities: {
    'browserName': 'phantomjs'
  },

  // Spec patterns are relative to the current working directly when
  // protractor is called.
  specs: config.e2e.specs,

  // Options to be passed to Jasmine-node.
  jasmineNodeOpts: {
    showColors: true,
    defaultTimeoutInterval: 30000
  }
};
