// An example configuration file.
config = require('./gulp/config');

exports.config = {
  seleniumAddress: 'http://localhost:4444/wd/hub',

  // Capabilities to be passed to the webdriver instance.
  capabilities: {
    'browserName': 'Firefox'
  },

  // Use the server started in browserSync:e2e gulp task

  baseUrl: 'localhost/projects/MoonshotProject/moondash/',

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
