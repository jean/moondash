'use strict';

module.exports = function(karma) {
  karma.set({
    files: [
      '../src/**/unit/*.spec.js',
    ],
    frameworks: ['jasmine', 'browserify'],
    preprocessors: {
      '../src/**/unit/*.spec.js': ['browserify']
    },
    browsers: ['PhantomJS'],
    reporters: ['dots'],
    singleRun: false,
    autoWatch: true,

    logLevel: 'LOG_INFO',

    browserify: {
      debug: true, // output source maps
      transform: ['brfs', 'browserify-shim']
      }
  });
};
