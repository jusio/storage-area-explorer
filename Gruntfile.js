module.exports = function (grunt) {

    // Project configuration.
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        clean: ['build'],
        zip: {
            release: {
                src: [
                    'app/css/*.css',
                    'app/*.js',
                    'app/components/*/*.js',
                    'app/chrome/*.js',
                    'app/html/*.html',
                    'manifest.json'
                ],
                dest: 'build/storage-area-explorer-release-' + Date.now() + '.zip'
            }

        }

    });

    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-zip');


    // Default task(s).
    grunt.registerTask('default', ['clean', 'zip']);

};