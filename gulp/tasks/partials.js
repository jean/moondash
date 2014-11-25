var gulp = require('gulp'),
  config = require('../config').partials,
  templateCache = require('gulp-angular-templatecache');

gulp.task('partials', function() {
  return gulp
    .src(config.src)
    .pipe(templateCache('moonshot-templates.js',
                        {module: 'moonshot', root:'/'}))
    .pipe(gulp.dest(config.dest));
});
