var
  gulp = require('gulp'),
  karma = require('karma-as-promised'),
  testConf = require('../config').midway;

gulp.task('midway', function () {
  return karma.server
    .start({
             configFile: __dirname + '/' + testConf.karma,
             singleRun: true
           });
});
