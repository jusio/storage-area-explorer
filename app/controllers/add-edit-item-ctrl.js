angular.module("storageExplorer").controller("AddEditItemCtrl", function ($scope, $rootScope, storage) {
    $rootScope.$watch('editObject', function () {
        if ($rootScope.editObject.value) {
            try {
                angular.fromJson($rootScope.editObject.value);
                $scope.validation = null;
            } catch (e) {
                $scope.validation = e.message;
            }
        }
    });

    $scope.cancel = function () {
        $rootScope.mode = 'list';
        $rootScope.editObject={};
    };

    $scope.save = function () {
        var obj = {};
        var editObj = $rootScope.editObject;
        obj[editObj.key] = JSON.parse(editObj.value);
        storage[$rootScope.currentType].set(obj, function () {
            $scope.cancel();
        });
    };
});