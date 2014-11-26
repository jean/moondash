---
layout: post
title:  "Modular Gulp"
categories: building packaging
date:   2014-11-26 02:38:02
---

We have sophisticated needs for our build and development process. We 
need a modular, configuration-driven approach to Gulp to keep up with 
the complexity. Splitting our ``gulpfile.js`` into separate tasks is 
the answer.

Thanks to Eric, we have a sophisticated, but simple, approach to Gulp. 
Our top-level ``gulpfile.js`` is quite simple:

{% highlight javascript %}
var requireDir = require('require-dir');

// Require all tasks in gulp/tasks, including subfolders
requireDir('./gulp/tasks', { recurse: true });
{% endhighlight %}

Through the magic of RequireJS packages and the ``require-dir`` Gulp 
plugin, all of our Gulp tasks are auto-discovered from a ``gulp`` 
subdirectory.

This subdirectory of Gulp tasks is driven by a ``config.js`` file that 
provides values, for this project, for each of the tasks in a ``tasks``
directory. This lets us re-use the tasks across projects and just 
adjust the config values to customize.

Here's what the ``config.js`` looks like at the moment:

{% highlight javascript %}
var dest = "./build";
var src = './src';
var demoSrc = './demos';

module.exports = {
  browserSync: {
    server: {
      // We're serving the src folder as well
      // for sass sourcemap linking
      baseDir: [dest, src],
      directory: true
    },
    files: [
      dest + "/**",
      // Exclude Map files
      "!" + dest + "/**.map"
    ]
  },
  markup: {
    src: [
      demoSrc + "/*/*"
    ],
    base: './demos',
    dest: dest
  },
  sass: {
    src: [
      src + "/**/*.scss"
    ],
    outputName: 'moondash.css',
    dest: dest
  },
  partials: {
    src: [
      src + '/**/*.partial.html'
    ],
    outputName: 'moondash-templates.js',
    moduleName: 'moondash',
    dest: dest
  },
  vendors: {
    outputName: 'moondash-vendors.js',
    dest: dest
  },
  browserify: {
    // Enable source maps
    debug: true,
    // A separate bundle will be generated for each
    // bundle config in the list below
    bundleConfigs: [{
      entries: src + '/module.js',
      dest: dest,
      outputName: 'moondash.js'
    }]
  }
};
{% endhighlight %}

Each task has corresponding configuration section, with some cross-task 
defaults at the top.

The task itself is a file in the ``gulp/tasks`` directory. As an 
example, we need to find all the Angular templates in Moondash and run 
them through a plugin that cooks them into distributable JavaScript. 
Here is ``gulp/tasks/partials.js``:

{% highlight javascript %}
var gulp = require('gulp'),
  config = require('../config').partials,
  templateCache = require('gulp-angular-templatecache');

gulp.task('partials', function () {
  return gulp
    .src(config.src)
    .pipe(templateCache(config.outputName,
                        {module: config.moduleName, root: '/'}))
    .pipe(gulp.dest(config.dest));
});
{% endhighlight %}

Gulp excels at letting you "watch" for changes and trigger a rebuild, 
so this ``partials`` task needs to be included in the ``watch`` task:

{% highlight javascript %}
var gulp  = require('gulp');
var config= require('../config');

gulp.task('watch', ['setWatch', 'browserSync'], function() {
  gulp.watch(config.markup.src, ['markup']);
  gulp.watch(config.partials.src, ['partials']);
  gulp.watch(config.sass.src, ['sass']);
});{% endhighlight %}

Changing a file that matches the ``config.partial.src`` glob pattern 
not only triggers a template-cache rebuild, it also triggers 
browserSync to reload the browser.
