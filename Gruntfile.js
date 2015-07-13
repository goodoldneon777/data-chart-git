module.exports = function(grunt) {

  grunt.initConfig({
    jshint: {
      files: ['Gruntfile.js', 'js/**/*.js'],
      options: {
        globals: {
          jQuery: true
        }
      }
    },
    concat: {
      options : {
        sourceMap: true
      },
      dist: {
        src: [
          'js/dev/global.js',
          'js/dev/extensions.js',
          'js/dev/fieldExpand.js',
          'js/dev/definitions.js',
          'js/dev/_master.js',
          'js/dev/sql.js',
          'js/dev/options.js',
          'js/dev/moreFilters.js',
          'js/dev/chart.js'
        ],
        dest: 'js/dist/main.js'
      }
    },
    uglify : {
      options : {
        sourceMap : true,
        sourceMapIncludeSources : true,
        sourceMapIn : 'js/dist/main.js.map'
      },
      dist: {
        src : '<%= concat.dist.dest %>',
        dest : 'js/dist/main.min.js'
      }
    },
    watch: {
      files: ['js/dev/*.js'],
      tasks: ['concat', 'uglify']
      // tasks: ['concat']
    }
  });

  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-watch');

  grunt.registerTask('default', ['jshint', 'concat', 'uglify']);
  // grunt.registerTask('default', ['jshint', 'concat']);
};