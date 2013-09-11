angular.module("storageExplorer").factory("prettyJson", function () {
    return function (obj) {
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
            if(val === null) {
                json.push('null');
            }

            json.push(val);
        }

        function tabs(depth) {
            while (depth > 0) {
                json.push("\t");
                depth--;
            }

        }

        prettyJson(obj, 0);
        return json.join('');
    }
});
