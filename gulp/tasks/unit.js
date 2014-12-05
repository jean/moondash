var gulp = require('gulp');
var karma = require('karma-as-promised');
var testConf = require('../config').unit

gulp.task('unit', function () {
  return karma.server.start({
    configFile: __dirname + '/' + testConf.karma,
    singleRun: true
  });
});
