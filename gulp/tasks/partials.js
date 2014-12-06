var gulp = require('gulp'),
    concat = require('gulp-concat'),
    streamqueue = require('streamqueue'),
    config = require('../config').partials,
    templateCache = require('gulp-angular-templatecache');

gulp.task('partials', function () {
    var stream = streamqueue({objectMode: true});
    stream.queue(gulp.src(config.src)
        .pipe(templateCache({module: config.moduleName,
                            root: config.root}))
    );
    stream.queue(gulp.src(config.vendors.src)
        .pipe(templateCache({module: config.moduleName,
                            root: config.vendors.root}))
    );
    stream.done()
        .pipe(concat(config.outputName))
        .pipe(gulp.dest(config.dest));
});
