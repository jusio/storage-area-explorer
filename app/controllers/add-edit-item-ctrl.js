angular.module("storageExplorer").controller("AddEditItemCtrl", function ($scope, $rootScope, storage) {


    $rootScope.$watch('editObject', function () {
        if($rootScope.currentDescriptor.stringOnly) {
            $scope.validation = null;
            return;
        }

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
        if(!$rootScope.currentDescriptor.stringOnly) {
            obj[editObj.key] = JSON.parse(editObj.value);
        } else {
            obj[editObj.key] = editObj.value;
        }
        storage[$rootScope.currentType].set(obj, function () {
            $scope.cancel();
        });
    };
});