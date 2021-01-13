/**
 * Created by Xunrong Li on 6/4/15.
 */

module.exports = function gruntTasks(grunt) {
  // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),

    // cleans generated folder before writing any files
    clean: {
      css: ['public/assets/css/generated/*.css'],
    },

    less: {
      development: {
        files: {
          // destination file and source file
          'public/assets/css/generated/style.css': 'public/assets/less/style.less',
        },
      },
    },

    autoprefixer: {
      dist: {
        files: {
          'public/assets/css/generated/style.css': 'public/assets/css/generated/style.css',
        },
      },
    },

    // check for javascript syntax errors in our js files
    eslint: {
      target: [
        'config/*.js',
        'public/**/*.js',
        '!public/assets/js/**/*.js',
        '!public/libs/**/*.js',
        '!public/**/*.min.js',
        '!public/bower_components/**/*.js',
        'app.js',
        'Gruntfile.js',
      ],
    },

    // minify our css files
    cssmin: {
      options: {
        shorthandCompacting: false,
        roundingPrecision: -1,
      },
      target: {
        files: [{
          expand: true,
          cwd: 'public/assets/css',
          src: ['login.css'],
          dest: 'public/assets/css/generated',
          ext: '.min.css',
        },
        {
          expand: true,
          cwd: 'public/assets/css/generated',
          src: ['*.*'],
          dest: 'public/assets/css/generated',
          ext: '.min.css',
        }],
      },
    },

    // concatenate all the minified css files
    // NOTE: third party css files are left out
    concat_css: {
      all: {
        src: [
          'public/assets/css/generated/style.min.css',
          'public/assets/css/generated/login.min.css',
        ],
        dest: 'public/assets/css/generated/styles.min.css',
      },
    },

    // minify image with imagemin
    // (Select optimization level between 0 and 7, default optimizationLevel = 3)
    imagemin: {
      dist: {
        options: {
          optimizationLevel: 3,
        },
        files: [{
          expand: true,
          cwd: 'public/assets/images/src',
          src: ['**/*.{png,jpg,gif,svg}'],
          dest: 'public/assets/images/',
        }],
      },
    },

    mochaTest: {
      backend: {
        options: {
          reporter: 'spec',
          captureFile: 'results.txt', // Optionally capture the reporter output to a file
          quiet: false, // Optionally suppress output to standard out (defaults to false)
          clearRequireCache: true, // Optionally clear the require cache before running tests
        },
        src: ['serverTest/**/*.spec.js'],
      },
    },

    // minify all the JS files excluding third-party libs
    uglify: {
      dist: {
        options: {
          mangle: false,
        },
        files: {
          'public/services/services.min.js': ['public/services/*.js', '!public/services/*.min.js'],
          'public/controllers/controllers.min.js': [
            'public/controllers/*.js',
            '!public/controllers/*.min.js',
          ],
          'public/directives/directives.min.js': [
            'public/directives/*.js',
            '!public/directives/*.min.js',
          ],
          'public/filter/filter.min.js': ['public/filter/*.js', '!public/filter/*.min.js'],
          'public/auth/auth.min.js': ['public/auth/*.js', '!public/auth/*.min.js'],
          'public/routers/routers.min.js': ['public/routers/*.js', '!public/routers/*.min.js'],
        },
      },
    },

    // Concat JS files from output of uglify
    concat: {
      dist: {
        src: ['public/services/services.min.js',
          'public/controllers/controllers.min.js',
          'public/directives/directives.min.js',
          'public/filter/filter.min.js',
          'public/auth/auth.min.js',
          'public/routers/routers.min.js',
        ],
        dest: 'public/ui.min.js',
      },
    },

    processhtml: {
      dev: {
        options: {
          strip: true,
          data: {
            message: 'This is development environment',
          },
        },
        files: {
          'public/index.html': ['public/src/index-build.html'],
        },
      },
      dist: {
        options: {
          strip: true,
          data: {
            message: 'This is production distribution',
          },
        },
        files: {
          'public/index.html': ['public/src/index-build.html'],
        },
      },
    },

    cachebust: {
      custom_options: {
        options: {
          type: 'timestamp',
        },
        files: [{
          expand: true,
          cwd: 'public',
          src: ['index.html'],
          dest: 'public',
        }],
      },
    },

    watch: {
      styles: {
        files: [
          'public/assets/less/**/*.less',
          'public/controllers/**/*.js',
          'public/directives/**/*.js',
          'public/services/**/*.js',
          'public/filter/**/*.js',
          'public/routers/**/*.js',
          'public/app.js',
        ], // which files to watch
        tasks: [
          'clean',
          'less',
          'autoprefixer',
          'cssmin',
          'concat_css',
          'imagemin',
          'uglify',
          'concat',
          'processhtml:dev',
          'cachebust',
        ],
        options: {
          nospawn: true,
        },
      },
    },
  });

  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-autoprefixer');
  grunt.loadNpmTasks('grunt-contrib-less');
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-eslint');
  grunt.loadNpmTasks('grunt-contrib-cssmin');
  grunt.loadNpmTasks('grunt-concat-css');
  grunt.loadNpmTasks('grunt-contrib-imagemin');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-cachebust');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-processhtml');
  grunt.loadNpmTasks('grunt-mocha-test');
  grunt.registerTask('default', [
    'clean',
    'less',
    'autoprefixer',
    'eslint',
    'cssmin',
    'concat_css',
    'imagemin',
    'uglify',
    'concat',
    'processhtml:dev',
    'cachebust',
    'watch',
  ]);
  grunt.registerTask('bluemix', [
    'clean',
    'less',
    'autoprefixer',
    'eslint',
    'cssmin',
    'concat_css',
    'imagemin',
    'uglify',
    'concat',
    'processhtml:dist',
    'cachebust',
    'watch',
  ]);
  grunt.registerTask('checkout', [
    'clean',
    'less',
    'autoprefixer',
    'cssmin',
    'concat_css',
    'imagemin',
    'uglify',
    'concat',
    'processhtml:dist',
    'cachebust',
  ]);
  grunt.registerTask('test', [
    'mochaTest:backend',
  ]);
};
