module.exports = function (grunt) {
    var path = require('path');
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
                router: function (filepath) {
                    var filename = path.basename(filepath);
                    if (filename == 'panel_production.html') {
                        return 'app/html/panel.html';
                    }
                    return filepath;
                },
                compression: 'DEFLATE',
                src: [
                    'components/bootstrap/dist/css/bootstrap.min.css',
                    'components/bootstrap/dist/js/bootstrap.min.js',
                    'components/bootstrap/dist/fonts/glyphicons-halflings-regular.woff',
                    'app/**',
                    '!app/html/panel.html',
                    'components/jquery/jquery.min.js',
                    'components/angular/angular.min.js',
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