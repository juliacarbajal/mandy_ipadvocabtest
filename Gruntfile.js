'use strict';

module.exports = function(grunt) {

  var pkg = grunt.file.readJSON('package.json');

  // Project configuration.
  var configOptions = {

    pkg: pkg,
    
    concat: {
      dist: {
        src: [
          'dev/src/App.js', 
          'dev/src/app/controllers/*.js', 
          'dev/src/app/Router.js', 
          'dev/src/app/models/*.js', 
          'dev/src/app/collections/*.js', 
          'dev/src/app/views/Base.js',
          'dev/src/app/views/**/*.js',
          'dev/src/utils/*.js'
        ],
        dest: 'build/js/<%= pkg.namespace %>.js'
      },
      libs : {
        src : [
          'node_modules/underscore/underscore-min.js',
          'node_modules/backbone/backbone-min.js',
          'dev/src/libs/*.js'
        ],
        dest: 'build/js/libs/libs.js'
      }
    },
    
    uglify: {
      dist: {
        src: '<%= concat.dist.dest %>',
        dest: 'build/js/<%= pkg.namespace %>.min.js'
      },
      libs: {
        src: '<%= concat.libs.dest %>',
        dest: 'build/js/libs/libs.min.js'
      }
    },

    jshint: {
      gruntfile: {
        options: {
          jshintrc: '.jshintrc'
        },
        src: 'Gruntfile.js'
      },
      src: {
        options: {
          jshintrc: '.jshintrc'
        },
        src: '<%= concat.dist.src %>'
      }
    }
  };

  var 
      filesToWatch = ['dev/src/**/*.js'],
      defaultTasks = ['jshint', 'concat'],
      deployTasks = ['jshint', 'concat', 'uglify'];

  configOptions.sass = {
      dev: {
      src: 'dev/sass/style.scss',
      dest: 'build/css/style.css',
      options: {
        style: 'expand',
        compass : true
      }
    },
    deploy: {
      src: 'dev/scss/style.scss',
      dest: 'build/css/style.css'
    }
  };

  filesToWatch.push('dev/sass/*.scss');
  defaultTasks.unshift('sass:dev');
  deployTasks.unshift('sass:deploy');

  configOptions.watch = {
    gruntfile: {
      files: '<%= jshint.gruntfile.src %>',
      tasks: ['jshint:gruntfile']
    },
    test: {
      files: filesToWatch,
      tasks: 'default'
    }
  };

  grunt.initConfig(configOptions);

  // These plugins provide necessary tasks.
  grunt.loadNpmTasks('grunt-contrib-sass');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-watch');

  // Default task.
  grunt.registerTask('default', defaultTasks);
  grunt.registerTask('deploy', deployTasks);

};
