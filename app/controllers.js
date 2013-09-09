angular.module("storageExplorer").controller("StorageCtrl", function ($scope, $q, storage) {
    $scope.sizeMap = {};
    $scope.mode = 'list'; //other mods add, edit
    $scope.test = "Working";
    $scope.currentType = 'local';

    $scope.delete = function (key) {
        $q.when(storage).then(function (storageInstance) {
            storage = storageInstance;
            var storageArea = storage[$scope.currentType];
            storageArea.remove(key);
        });
    };
    $scope.add = function () {
        $scope.mode = 'add';
        $scope.newValue = '';
    };
    $scope.save = function () {
        $q.when(storage).then(function (storageInstance) {
            storage = storageInstance;
            var storageArea = storage[$scope.currentType];
            var obj = {};
            obj[$scope.key] = angular.fromJson($scope.value);
            storageArea.set(obj, function () {
                $scope.mode = 'list';
                $scope.key = null;
                $scope.value = null;
            });

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
            var json = [];

            function prettyJson(val, depth) {
                if (angular.isArray(val)) {
                    json.push("[");

                    angular.forEach(val, function (item) {
                        if (!angular.isArray(item) && angular.isObject(item)) {
                            json.push("\n");
                            tabs(depth + 2);
                        }
                        prettyJson(item, depth + 2);
                        json.push(", ");
                    });
                    if (val.length > 0) {
                        json.pop();
                    }
                    json.push("]");
                    return;
                }

                if (angular.isObject(val)) {
                    json.push("{\n");
                    var empty = true;
                    angular.forEach(val, function (value, key) {
                        if (key === '$$hashKey') {
                            return;
                        }
                        empty = false;
                        tabs(depth + 1);
                        json.push('"' + key + '" : ');
                        prettyJson(value, depth + 1);
                        json.push(",\n");
                    });
                    json.pop();
                    if (!empty) {
                        json.push("\n");
                        tabs(depth);
                    } else {
                        json.push("{");
                    }
                    json.push("}");
                    return;
                }
                if (angular.isString(val)) {
                    json.push('"' + val + '"');
                    return;
                }

                json.push(val);
            }

            function tabs(depth) {
                while (depth > 0) {
                    json.push("\t");
                    depth--;
                }

            }

            prettyJson(value, 0);
            $scope.value = json.join('');

        }

    };
    $scope.clear = function () {
        if (!window.confirm("Are you sure")) {
            return;
        }
        $q.when(storage).then(function (storageInstance) {
            var storageArea = storage[$scope.currentType];
            storageArea.clear();
        });
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
        $q.when(storage).then(function (storageInstance) {
            storage = storageInstance;
            var storageArea = storage[$scope.currentType];
            storageArea.get(function (results) {
                $scope.meta = {};
                $scope.results = results;
                angular.forEach(storageArea, function (val, key) {
                    if (angular.isNumber(val)) {
                        $scope.meta[key] = val;
                    }
                });
                refreshStats();
            });
        });

    });

    function refreshStats() {
        $scope.itemCount = 0;
        $scope.bytesInUse = 0;
        angular.forEach($scope.results, function (val, key) {
            $scope.itemCount++;
            $q.when(storage).then(function (storageInstance) {
                var area = storageInstance[$scope.currentType];
                area.getBytesInUse(key, function (amount) {
                    $scope.bytesInUse += amount;
                    $scope.sizeMap[key] = amount;
                });
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