module.exports = function(grunt) {
    // Project configuration.
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        browserify2: {
            client: {
                entry: "./js/main.js",
                compile: "./bin/js/main.js"
            },
        },
        uglify: {
            options: {
                banner: '/*! <%= pkg.name %> <%= grunt.template.today("yyyy-mm-dd") %> */\n'
            },
            client: {
                src: 'bin/js/main.js',
                dest: 'bin/js/main.min.js'
            }
        },
        jshint: {
            all: [
                "js/**/*.js"
            ]
        }
    });

    // Load the plugin that provides the "uglify" task.
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-browserify2');
    grunt.loadNpmTasks('grunt-contrib-jshint');

    // Default task(s).
    grunt.registerTask('default', ['jshint', 'browserify2', 'uglify']);

    //grunt.file.copy("fonts/stylesheet.css", "bin/fonts/stylesheet.css");
    //grunt.file.copy("fonts/SF_Archery_Black-webfont.ttf", "bin/fonts/SF_Archery_Black-webfont.ttf");
    grunt.file.copy("html/index.html", "bin/index.html");
    var files = require("./js/files");
    for(var file in files) {
        grunt.file.copy("assets/" + files[file], "bin/" + files[file]);
    }
};
