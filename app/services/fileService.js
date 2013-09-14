angular.module("storageExplorer").factory("fileSystem", function ($q, $timeout, prettyJson, $window, $rootScope) {

    return {
        promptFileDownload: function (fileName, content, mediatype, isBinary) {
            var a = $window.document.createElement('a');
            a.download = fileName;
            if (!isBinary) {
                a.href = "data:" + mediatype + ":" + content;
                a.click();
            } else {
                var blob = new $window.Blob([content], {type: mediatype});
                var reader = new $window.FileReader();
                reader.onload = function () {
                    a.href = reader.result;
                    a.click();
                };
                reader.readAsDataURL(blob);
            }


        },
        promptFileSelectionAsText: function () {
            var deferred = $q.defer();
            var fileUpload = $window.document.createElement("input");
            fileUpload.type = "file";
            fileUpload.click();
            fileUpload.addEventListener("change", function (a) {
                try {
                    var file = fileUpload.files[0];
                    if (!file) {
                        deferred.reject();
                        !$rootScope.$$phase && $rootScope.$apply();
                        return;
                    }
                    var reader = new $window.FileReader();
                    reader.onload = function () {
                        deferred.resolve(reader.result, file.name);
                        !$rootScope.$$phase && $rootScope.$apply();
                    };
                    reader.readAsText(file);
                } catch (e) {
                    deferred.reject();
                    !$rootScope.$$phase && $rootScope.$apply();
                }
            });

            return deferred.promise;
        }
    }

});
