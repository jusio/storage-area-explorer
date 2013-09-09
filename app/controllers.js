angular.module("storageExplorer").controller("StorageCtrl", function ($scope, storage, prettyJson) {
    dummyLog("Initializing controller")
    $scope.sizeMap = {};
    $scope.mode = 'list';
    $scope.currentType = 'local';

    $scope.delete = function (key) {
        storage[$scope.currentType].remove(key);
    };
    $scope.add = function () {
        $scope.mode = 'add';
        $scope.newValue = '';
    };
    $scope.save = function () {
        var obj = {};
        obj[$scope.key] = angular.fromJson($scope.value);
        storage[$scope.currentType].set(obj, function () {
            $scope.mode = 'list';
            $scope.key = null;
            $scope.value = null;
        });
    };
    $scope.cancel = function () {
        $scope.mode = 'list';
        $scope.key = null;
        $scope.value = null;
    };
    $scope.edit = function (name, value) {
        $scope.mode = 'edit';
        $scope.key = name;
        if (!angular.isObject(value)) {
            $scope.value = angular.toJson(value);
        } else {
            $scope.value = prettyJson(value);
        }

    };
    $scope.clear = function () {
        if (!window.confirm("Are you sure")) {
            return;
        }
        storage[$scope.currentType].clear();
    };

    $scope.$watch('value + key', function () {
        if ($scope.value) {
            try {
                angular.fromJson($scope.value);
                $scope.validation = null;
            } catch (e) {
                $scope.validation = e.message;
            }
        }
    });

    $scope.$watch('currentType', function () {
        storage[$scope.currentType].get(function (results) {
            $scope.meta = storage[$scope.currentType].getMeta();
            dummyLog("Meta is " + $scope.meta);
            $scope.results = results;
            refreshStats();
        });

    });

    function refreshStats() {
        $scope.itemCount = 0;
        $scope.bytesInUse = 0;
        angular.forEach($scope.results, function (val, key) {
            $scope.itemCount++;
            storage[$scope.currentType].getBytesInUse(key, function (amount) {
                $scope.bytesInUse += amount;
                $scope.sizeMap[key] = amount;
            });
        });
    }

    $scope.$on("$storageChanged", function (event, change) {
        if ($scope.currentType === change.type) {
            angular.forEach(change.changes, function (val, key) {
                if (angular.isDefined(val.newValue)) {
                    $scope.results[key] = val.newValue;
                } else {
                    delete $scope.results[key];
                }
            });
            refreshStats();
        }
    });


});