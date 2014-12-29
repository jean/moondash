'use strict';

module.exports = function (config) {
  config.set(
    {
      files: [
        'build/moondash-vendors.js',
        'build/moondash.js',
        'src/**/midway/*.js'
      ],
      frameworks: ['jasmine'],
      browsers: ['PhantomJS'],
      //reporters: ['dot'],
      reporters: ['progress', 'junit'],
      singleRun: false,
      autoWatch: true,

      logLevel: 'LOG_INFO'

    }
  );
};
