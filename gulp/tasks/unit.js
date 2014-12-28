var
  gulp = require('gulp'),
  mocha = require('gulp-mocha');

//var karma = require('karma-as-promised');
//var testConf = require('../config').unit
//
//gulp.task('unit', function () {
//  return karma.server.start({
//    configFile: __dirname + '/' + testConf.karma,
//    singleRun: false
//  });
//});

gulp.task('unit', function () {
  return gulp.src([
                    'src/common/test/unit/**/*.js'
                  ])
    .pipe(mocha({reporter: 'dot'}));
});
