var distMode = (process.argv.slice(2).indexOf('--dist')>=0);
var dest = distMode ? "./dist" : "./build";
var src = './src';
var demoSrc = './demos';

module.exports = {
  test: {
    karma: '../../test/karma.conf.js'
  },
  buildMode: {
    dist: distMode
  },
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
  icons: {
    src: [
      './node_modules/font-awesome/fonts/*',
      './node_modules/bootstrap-sass/assets/fonts/bootstrap/*'
    ],
    dest: dest + '/fonts'
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
    vendors: {
      src: [
        './node_modules/angular-bootstrap/template/*/*.html'
      ],
      root: 'template',
    },
    outputName: 'moondash-templates.js',
    moduleName: 'moondash',
    dest: dest
  },
  vendors: {
    outputName: 'moondash-vendors.js',
    templates: [
      './node_modules/angular-bootstrap/template/*/*.html'
    ],
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
  },
  templates: {
    src: [
      './node_modules/angular-bootstrap/template/*/*.html'
    ],
    dest: dest,
    outputName: 'moondash-vendors-templates.js'
  },
  dist: {
    pruneVendors: [
      "angular-mocks"
    ]
  }
};
