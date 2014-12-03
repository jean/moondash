'use strict';

module.exports = function(karma) {
  karma.set({
    files: [
      'src/**/*.js',
      'test/**/*.spec.js'
    ],
    frameworks: ['jasmine', 'browserify'],
    preprocessors: {
      'src/**/*.js': ['browserify'],
      'test/**/*.spec.js': ['browserify']
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
