angular.module("storageExplorer").directive("entryValue", function ($compile) {
    function checkWidth(string) {
        if (string.length > 50) {
            return string.substr(0, 49) + "...";
        }
        return string;
    }

    var stringTemplate = '<span class="quote">"</span><span class="string">{{displayedValue}}</span><span class="quote">"</span>';
    var booleanTemplate = '<span class="boolean">{{displayedValue}}</span>';
    var numberTemplate = '<span class="number">{{displayedValue}}</span>';

    function escape(input) {
        var string = '' + input;
        return string.replace('<', '&lt;').replace('>', '&gt;')
    }

    function string(value) {
        return stringTemplate.replace('{{displayedValue}}', checkWidth(escape(value)));
    }

    function bool(value) {
        return booleanTemplate.replace('{{displayedValue}}', value);
    }

    function num(value) {
        return numberTemplate.replace('{{displayedValue}}', value)
    }

    function buildObjectPreview(obj) {

        function rval(val) {
            if (angular.isString(val)) {
                return string(val);
            }
            if (angular.isNumber(val)) {
                return num(val);
            }
            if (angular.isObject(val)) {
                return buildObjectPreview(val);
            }
            if (val === null) {
                return bool('null');
            }
            return bool(val);
        }


        var element = angular.element('<span></span>');
        if (angular.isArray(obj)) {
            element.append(angular.element('<span>[</span>'));
            element.append(angular.element('<span>array</span>'));
            element.append(angular.element('<span> ]</span>'))
        } else if (angular.isObject(obj)) {
            element.append(angular.element('<span>{</span>'));
            angular.forEach(obj, function (value, key) {
                element.append(string(key)).append(':').append(rval(value)).append(',');
            });


            element.append(angular.element('<span>}</span>'))
        }
        element.bind("click", function () {

        });
        return element;
    }

    return {
        restrict: 'E',
        scope: {
            value: "="
        },
        link: function (scope, element, attr) {
            var value = scope.value;
            if (angular.isString(value)) {
                element.html(string(value));
            } else if (angular.isNumber(value)) {
                element.html(num(value));
            } else if (angular.isObject(value)) {
                element.html('');
                element.append(checkWidth(angular.toJson(value)));
            } else if (value === null) {
                element.html(bool('null'));
            } else {
                element.html(bool(value));
            }
        }
    }


});