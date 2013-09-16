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
        bower: {
            install: {
                options:{
                    copy:false
                }
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
            },
            testsCoverage: {
                compression: 'DEFLATE',
                src: [
                    'coverage/Chrome */**'
                ],
                dest: 'build/coverage.zip'
            }
        }
    });

    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-zip');
    grunt.loadNpmTasks('grunt-karma');
    grunt.loadNpmTasks('grunt-bower-task');


    // Default task(s).
    grunt.registerTask('default', ['clean', 'karma', 'zip']);

    grunt.registerTask("ci", ['clean', 'bower','karma', 'zip'])

};