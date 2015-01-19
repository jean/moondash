var browserify   = require('browserify');
var partialify   = require('partialify');
var bundleLogger = require('../util/bundleLogger');
var gulp         = require('gulp');
var handleErrors = require('../util/handleErrors');
var source       = require('vinyl-source-stream');
var streamify    = require('gulp-streamify');
var uglify       = require('gulp-uglify');
var exorcist     = require('exorcist')
var buildMode    = require('../config').buildMode;
var dist         = require('../config').dist;
var PACKAGE      = require('../../package.json');
var config       = require('../config').vendors;

gulp.task('vendors', function(callback) {

    var bundler = browserify({
        // Enable source maps
        debug: config.debug
    });

    for(var key in PACKAGE.browser) {
        if(!buildMode.dist || dist.pruneVendors.indexOf(key) < 0) {
            bundler.require(
                PACKAGE.browser[key],
                {expose: key}
            );
        }
    }

    // Use partialify to allow Angular templates to be require()
    bundler.transform(partialify);

    // Log when bundling starts
    bundleLogger.start(config.outputName);

    return bundler
    .bundle()
    // Report compile errors
    .on('error', handleErrors)
    .pipe(exorcist(
        config.dest + '/maps/' + config.outputName + '.map',
        'maps/' + config.outputName + '.map'
    ))
    .pipe(source(config.outputName))
    .pipe(streamify(uglify()))
    .pipe(gulp.dest(config.dest))
    .on('end', function() {
        // Log when bundling completes
        bundleLogger.end(config.outputName)
    });

});
