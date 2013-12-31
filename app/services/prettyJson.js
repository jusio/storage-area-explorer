angular.module("storageExplorer").factory("prettyJson", function () {
    return function (obj) {
       return JSON.stringify(obj, null,'\t');
    }
});
