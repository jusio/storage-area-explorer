angular.module("storageExplorer").controller("StorageCtrl", function ($scope, $rootScope, storage, prettyJson, $window, $timeout, appContext) {
    var rawData;
    var results = $scope.results = [];
    $rootScope.editObject = {};
    var descriptos = {
        "local": {title: "Local Storage Area"},
        "sync": {title: "Sync Storage Area"},
        "managed": {title: "Managed Storage Area", readonly: true},
        "localStorage": {title: "Window.localStorage", stringOnly: true},
        "sessionStorage": {title: "Window.sessionStorage", stringOnly: true}
    };


    appContext().then(function (appInfo) {
        $rootScope.storageDescriptors = [];

        appInfo.storageTypes.forEach(function (value) {
            if (!$rootScope.currentType) {
                $rootScope.currentType = value;

            }
            var descriptor = descriptos[value];
            descriptor.name = value;
            if (!$rootScope.currentDescriptor) {
                $rootScope.currentDescriptor = descriptor;
            }
            $rootScope.storageDescriptors.push(descriptor);
        });

        $rootScope.mode = 'list';
        $rootScope.setType = function (type) {
            $rootScope.currentType = type.name;
            $rootScope.currentDescriptor = type;
        };
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
            //TODO Fix stats
//            angular.forEach($scope.stats, function (stats, type) {
//                storage[type].getBytesInUse(function (bytes) {
//                    $scope.stats[type].bytesInUse = bytes;
//                });
//            });
//            storage.sync.get(function (obj) {
//                $scope.stats.sync.count = Object.keys(obj).length;
//            });
//            angular.forEach($scope.results, function (val) {
//                $scope.itemCount++;
//                storage[$scope.currentType].getBytesInUse(val.name, function (amount) {
//                    val.bytesInUse = amount;
//                });
//            });
        }

        $scope.$on("$storageChanged", function (event, change) {
            if ($scope.currentType === change.type) {
                var specialStorages = ["localStorage", "sessionStorage"]; //Omg this app already seen so many hacks...
                angular.forEach(change.changes, function (val, key) {
                    if (specialStorages.indexOf(change.type) > -1) {
                        if (key === "") {
                            rawData = {};
                        } else {
                            if (va.newValue === null) {
                                delete rawData[key];
                            } else {
                                rawData[key] = val.newValue;
                            }
                        }

                    } else {
                        if (angular.isDefined(val.newValue)) {
                            rawData[key] = val.newValue;
                        } else {
                            delete rawData[key];
                        }
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
    }, function () {
        $rootScope.mode = "error";
    });


    function adaptRawData() {
        var resultsToRemove = [];
        var keys = Object.keys(rawData);
        var leftOverKeys = Object.keys(rawData);
        $scope.results.forEach(function (result) {
            if (keys.indexOf(result.name) > -1) {
                result.value = JSON.parse(JSON.stringify(rawData[result.name]));
                leftOverKeys.splice(leftOverKeys.indexOf(result.name), 1);
            } else {
                resultsToRemove.push(result);
            }
        });
        leftOverKeys.forEach(function (key) {
            $scope.results.push({name: key, value: JSON.parse(JSON.stringify(rawData[key]))});
        });

        resultsToRemove.forEach(function (resultToRemove) {
            $scope.results.splice($scope.results.indexOf(resultToRemove), 1);
        });
        $scope.results.sort(function (a, b) {
            if (a.name > b.name) {
                return 1
            }
            if (a.name < b.name) {
                return -1;
            }
            return 0;
        });

    }


});