angular.module("storageExplorer").controller("StorageCtrl", function ($scope, $rootScope, storage, prettyJson, $window, $timeout) {
    var rawData;

    function adaptRawData() {
        $scope.results = [];
        Object.keys(rawData).forEach(function (key) {
            $scope.results.push({name: key, value: JSON.parse(JSON.stringify(rawData[key]))})
        });
    }

    $scope.sizeMap = {};
    $rootScope.mode = 'list';
    $rootScope.currentType = 'local';
    $rootScope.setType = function (type) {
        $rootScope.currentType = type;
    };
    $rootScope.editObject = {};
    $scope.stats = {
        local: {},
        sync: {}
    };
    $scope.meta = {
        sync: storage.sync.getMeta(),
        local: storage.local.getMeta()
    };
    $scope.delete = function (key) {
        storage[$scope.currentType].remove(key);
    };
    $scope.add = function () {
        window.close();
        $rootScope.mode = 'add';
        $rootScope.editObject.value = '';
    };


    $scope.edit = function (name) {
        $rootScope.mode = 'edit';
        $rootScope.editObject.key = name;
        var value = rawData[name];
        if (!angular.isObject(value)) {
            $rootScope.editObject.value = JSON.stringify(value);
        } else {
            $rootScope.editObject.value = prettyJson(value);
        }
    };
    $scope.clear = function () {
        if (!$window.confirm("Are you sure")) {
            return;
        }
        storage[$rootScope.currentType].clear();
    };


    $rootScope.$watch('currentType', function () {
        storage[$rootScope.currentType].get(function (results) {
            rawData = results;
            adaptRawData();
            refreshStats();
        });
    });

    function refreshStats() {
        $scope.itemCount = 0;
        $scope.bytesInUse = 0;
        angular.forEach($scope.stats, function (stats, type) {
            storage[type].getBytesInUse(function (bytes) {
                $scope.stats[type].bytesInUse = bytes;
            });
        });
        storage.sync.get(function (obj) {
            $scope.stats.sync.count = Object.keys(obj).length;
        });
        angular.forEach($scope.results, function (val) {
            $scope.itemCount++;
            storage[$scope.currentType].getBytesInUse(val.name, function (amount) {
                val.bytesInUse = amount;
            });
        });
    }

    $scope.$on("$storageChanged", function (event, change) {
        if ($scope.currentType === change.type) {
            angular.forEach(change.changes, function (val, key) {
                if (angular.isDefined(val.newValue)) {
                    rawData[key] = val.newValue;
                } else {
                    delete rawData[key];
                }
            });
            adaptRawData();
            refreshStats();
        }
    });
    $scope.$on("$valueChanged", function (event, key, newValue) {
        try {
            var update = {};
            update[key] = newValue;
            //bug? for some reason changes aren't committed
            $timeout(function () {
                storage[$rootScope.currentType].set(update);
            }, 1);

        } catch (e) {
        }
    });


});