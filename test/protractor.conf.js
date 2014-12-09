// An example configuration file.
config = require('../gulp/config');

exports.config = {
  seleniumAddress: 'http://0.0.0.0:4444/wd/hub',

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
