// An example configuration file.
config = require('./gulp/config');

exports.config = {
  framework: 'jasmine2',
  seleniumAddress: 'http://localhost:4444/wd/hub',

  // Capabilities to be passed to the webdriver instance.
  capabilities: {
    'browserName': 'firefox'
  },

  // Use the server started in browserSync:e2e gulp task

  baseUrl: 'http://localhost:3001/',

  specs: [
    'src/*/test/e2e/*.js'
  ],

  // Options to be passed to Jasmine-node.
  jasmineNodeOpts: {
    showColors: true,
    defaultTimeoutInterval: 20000
  }

};
