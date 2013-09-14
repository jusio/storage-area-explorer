angular.module("storageExplorer").controller("ExportImportCtrl", function ($scope, $rootScope, fileSystem, clipboard, appContext, storage, prettyJson) {
    $scope.export = function () {
        storage[$rootScope.currentType].get(function (items) {
            appContext().then(function (info) {
                fileSystem.promptFileDownload($scope.currentType + '_storage_' + info.name + '.json', prettyJson(items), 'application/json', true);
            });
        });
    };

    $scope.exportClipboard = function () {
        storage[$rootScope.currentType].get(function (items) {
            clipboard.put(prettyJson(items));
        });
    };
    $scope.importClipboard = function () {
        clipboard.get().then(function (value) {
            try {
                var parse = JSON.parse(value);
                storage[$rootScope.currentType].clear(function () {
                    storage[$rootScope.currentType].set(parse);
                });
            } catch (e) {
                $rootScope.importError = {
                    content: value,
                    message: "Failed to parse json, error message: " + e.message,
                    type: "Clipboard"
                };
            }
        });
    };

    $scope.import = function () {
        fileSystem.promptFileSelectionAsText().then(function (fileContent, name) {
            try {
                var parse = JSON.parse(fileContent);
                storage[$rootScope.currentType].clear(function () {
                    storage[$rootScope.currentType].set(parse);
                });
            } catch (e) {
                $rootScope.importError = {
                    content: fileContent,
                    file: name,
                    message: "Failed to parse content , error message " + e.message,
                    type: 'File'
                };
            }
        });
    };

});