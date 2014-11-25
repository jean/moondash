var gulp = require('gulp'),
  config = require('../config').partials,
  templateCache = require('gulp-angular-templatecache');

gulp.task('partials', function() {
  return gulp
    .src(config.src)
    .pipe(templateCache('moondash-templates.js',
                        {module: 'moondash', root:'/'}))
    .pipe(gulp.dest(config.dest));
});
