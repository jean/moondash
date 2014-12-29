// An example configuration file.
config = require('./gulp/config');

exports.config = {
  directConnect: true,

  // Capabilities to be passed to the webdriver instance.
  //capabilities: {
  //  'browserName': 'chrome'
  //},

  // Use the server started in browserSync:e2e gulp task

  baseUrl: 'http://localhost:3001/',

  specs: [
    'src/*/test/e2e/*.js'
  ],

  // Options to be passed to Jasmine-node.
  jasmineNodeOpts: {
    showColors: true,
    includeStackTrace: true,
    defaultTimeoutInterval: 20000
  }

};
