module.exports = function (grunt) {

    // Project configuration.
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        clean: ['build'],
        karma: {
            unit: {
                configFile: 'karma.conf.js'
            }
        },
        zip: {
            release: {
                compression: 'DEFLATE',
                src: [
                    'app/css/styles.css',
                    'app/css/bootstrap/css/bootstrap.css',
                    'app/css/bootstrap/js/bootstrap.js',
                    'app/css/bootstrap/fonts/glyphicons-halflings-regular.woff',
                    'app/*.js',
                    'app/components/jquery/jquery.js',
                    'app/components/angular/angular.js',
                    'app/chrome/*.js',
                    'app/html/*.html',
                    'app/services/*.js',
                    'app/directives/*.js',
                    'app/controllers/*.js',
                    'app/filters/*.js',
                    'manifest.json'
                ],
                dest: 'build/storage-area-explorer-v<%=pkg.version%>_' + Date.now() + '.zip'
            }

        }
    });

    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-zip');
    grunt.loadNpmTasks('grunt-karma');

    // Default task(s).
    grunt.registerTask('default', ['clean', 'zip']);

};