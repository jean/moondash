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