module.exports = function (grunt) {

    // Project configuration.
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        concat: {
            dist: {
                src: ["js/*.js"],
                dest: "build/js/app.js"
            }
        }, copy: {
            main: {
                files: [
                    {expand: true, src: ['js/chrome/*.js'], dest: 'build/'},
                    {src: ['html/**'], dest: 'build/'},
                    {src: ['css/**'], dest: 'build/'},
                    {src: 'manifest.json', dest: 'build/'}

                ]
            }

        }, clean: ['build']
    });

    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-contrib-clean');


    // Default task(s).
    grunt.registerTask('default', ['clean', 'concat', 'copy']);

};