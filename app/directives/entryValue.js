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
    var objectTemplate = '<span class="bracket">{</span><span class="object">{{displayedValue}}</span><span class="bracket">}</span>';
    var arrayTemplate = '<span class="bracket">[</span>{{displayedValue}}<span class="bracket">]</span>';

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

    function object(value) {
        if (angular.isArray(value)) {
            return array(value);
        }
        if (angular.isString(value)) {
            return string(value);
        }
        if (angular.isNumber(value)) {
            return num(value);
        }
        if (angular.isObject(value)) {
            var template = [];
            angular.forEach(value, function (propVal, propKey) {
                if (propKey !== "$$hashKey") {
                    console.log(propKey);
                    template.push(string(propKey));
                    template.push(" : ");
                    template.push(object(propVal));
                    template.push(", ");
                }
            });
            template.pop();
            return objectTemplate.replace("{{displayedValue}}", template.join(''));
        }
        if (value === null) {
            return bool(null);
        }
        return bool(value);


    }

    function array(value) {

        var template = [];
        angular.forEach(value, function (propVal) {
            template.push(object(propVal));
            template.push(", ");
        });
        template.pop();
        return arrayTemplate.replace("{{displayedValue}}", template.join(''));
    }

    function val(val) {
        if (angular.isString(val)) {
            return string(val);
        }
        if (angular.isNumber(val)) {
            return num(val);
        }
        if (angular.isObject(val)) {
            return object(val);
        }
        if (val === null) {
            return bool('null');
        }
        return bool(val);
    }


    return {
        restrict: 'E',
        scope: {
            value: "=",
            key: "="
        },
        link: function (scope, element, attr) {
            var value = scope.value;
            element.append(val(value));
            element.bind("dblclick", function () {
                var editor = angular.element("<input type='text' style='width:100%;height:100%'>");
                editor.val(angular.toJson(value));
                element.html('');
                element.append(editor);
                editor.select();
                editor.bind("blur", function () {
                    element.html(val(value));
                });
                editor.bind("keydown", function (e) {
                        editor.css("backgroundColor","");
                    if (e.keyCode == 13) {
                        var newValue = editor.val();
                        try {
                            scope.$emit("$valueChanged", scope.key, angular.fromJson(newValue));
                        } catch (e) {
                            editor.css("backgroundColor","red");
                            return;
                        }

                    }
                    if (e.keyCode == 13 || e.keyCode == 27) {
                        editor.blur();
                    }
                });
            });
        }
    }


});