var
  gulp = require('gulp'),
  karma = require('karma-as-promised'),
  testConf = require('../config').midway;

gulp.task('midway', ['build'], function () {
  return karma.server
    .start({
             configFile: __dirname + '/' + testConf.karma,
             singleRun: true
           });
});

gulp.task('midway:watch', function () {
  return karma.server
  .start({
    configFile: __dirname + '/' + testConf.karma,
    singleRun: true
  });
});
