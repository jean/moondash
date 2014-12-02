var gulp = require('gulp');
var karma = require('karma-as-promised');
var testConf = require('../config').test

gulp.task('test', function () {
  return karma.server.start({
    configFile: __dirname + '/../../' + testConf.karmaConfSrc,
    singleRun: true
  });
});
