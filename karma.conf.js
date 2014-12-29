'use strict';

module.exports = function (karma) {
  karma.set(
    {
      files: [
        'build/moondash-vendors.js',
        'src/**/midway/*.js'
      ],
      frameworks: ['jasmine', 'browserify'],
      preprocessors: {
        'src/**/midway/*.js': ['browserify']
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
    }
  );
};
