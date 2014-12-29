'use strict';

module.exports = function (config) {
  config.set(
    {
      files: [
        'build/moondash-vendors.js',
        'src/**/midway/*.js'
      ],
      frameworks: ['browserify', 'jasmine'],
      preprocessors: {
        'src/**/midway/*.js': ['browserify']
      },
      browsers: ['PhantomJS'],
      //reporters: ['dot'],
      reporters: ['progress', 'junit'],
      singleRun: false,
      autoWatch: true,

      logLevel: 'LOG_INFO',

      browserify: {
        debug: true,
        transform: ['brfs', 'browserify-shim']
      }
    }
  );
};
