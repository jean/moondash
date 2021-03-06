var distMode = (process.argv.slice(2).indexOf('--dist') >= 0);
var distWithMock = (process.argv.slice(2).indexOf('--mock') >= 0);
var dest = distMode ? "./dist" : "./build";
var src = './src';
var demoSrc = './demos';

module.exports = {
  e2e: {
    protractor: '../../protractor.conf-travis.js',
    specs: [
      'src/*/test/e2e/*.js'
    ]
  },
  unit: {
    tests: ['src/**/test/unit/*.js'],
    src: ['src/*/*.js']
  },
  midway: {
    karma: '../../karma.conf.js'
  },
  buildMode: {
    dist: distMode
  },
  browserSync: {
    dev: {
      server: {
        // We're serving the src folder as well
        // for sass sourcemap linking
        baseDir: [dest, src],
        directory: true
      },
      open: false,
      files: [
        dest + "/**",
        // Exclude Map files
        "!" + dest + "/**.map"
      ]
    },
    e2e: {
      port: 3001,
      server: {
        // We're serving the src folder as well
        // for sass sourcemap linking
        baseDir: ['.'],
        directory: true
      },
      open: false,
      files: [
        src + "/**",
        // Exclude Map files
        "!" + dest + "/**.map"
      ]
    }
  },
  icons: {
    src: [
      './node_modules/ui-grid/dist/release/ui-grid.eot',
      './node_modules/ui-grid/dist/release/ui-grid.ttf',
      './node_modules/ui-grid/dist/release/ui-grid.woff',
      './node_modules/font-awesome/fonts/*',
      './node_modules/bootstrap-sass/assets/fonts/bootstrap/*'
    ],
    dest: dest + '/fonts'
  },
  markup: {
    src: [
      demoSrc + "/**/*"
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
  vendors: {
    // Enable source maps
    debug: true,
    outputName: distWithMock ?
      'moondash-vendors-with-mock.js' : 'moondash-vendors.js',
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
  dist: {
    pruneVendors: distWithMock ? [] : [
      "angular-mocks"
    ]
  },
  checker: {
    src: ['src/*/*.js', '!src/mockapi/index.js']
  }
};
