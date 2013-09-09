angular.module("storageExplorer").directive("entryValue", function () {
    function checkWidth(string) {
        if (string.length > 50) {
            return string.substr(0, 49) + "...";
        }
        return string;
    }

    return {
        restrict: 'E',
        scope: {
            value: "="
        },
        link: function (scope, element, attr) {
            var value = scope.value;
            element.addClass("displayedValue");
            if (angular.isString(value)) {
                element.html('"' + checkWidth(value) + '"');
                return;
            }
            if (angular.isNumber(value)) {
                element.html(value);
                return;
            }
            if (angular.isObject(value)) {
                element.html(checkWidth(angular.toJson(value)));
                return;
            }
            if (value === null) {
                element.html("null");
                return;
            }
            element.html(value);

        }
    }


});