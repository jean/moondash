'use strict';

module.exports = function(karma) {
  karma.set({
    files: [
      '../src/**/*.spec.js',
    ],
    frameworks: ['jasmine', 'browserify'],
    preprocessors: {
      '../src/**/*.spec.js': ['browserify']
    },
    browsers: ['PhantomJS'],
    reporters: ['dots'],
    singleRun: true,
    autoWatch: false,

    logLevel: 'LOG_DEBUG',

    browserify: {
      debug: true, // output source maps
      transform: ['brfs', 'browserify-shim']
      }
  });
};
