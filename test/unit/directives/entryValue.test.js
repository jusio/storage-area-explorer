describe("Entry value directive test", function () {

    var scope,
        elem,
        compiled,
        html;

    beforeEach(function () {
        module('storageExplorer');
        html = '<entry-value key="key" value="value"></div>';
        inject(function ($compile, $rootScope) {
            scope = $rootScope.$new();
            elem = angular.element(html);
            scope.key = "key";
            scope.value = "value";
            compiled = $compile(elem);
            compiled(scope);
            scope.$digest();
        });
    });


    it("should render the string", function () {
        scope.value = "$value";
        scope.$digest();
        expect(elem.text()).toBe('"$value"')
    });

    it("should render a number", function () {
        scope.value = 1;
        scope.$digest();
        expect(elem.text()).toBe('1');
    });

    it("should render a boolean", function () {
        scope.value = false;
        scope.$digest();
        expect(elem.text()).toBe('false');
    });

    it("should render a null", function () {
        scope.value = null;
        scope.$digest();
        expect(elem.text()).toBe('null');
    });

    it("should render an empty object", function () {
        scope.value = {};
        scope.$digest();
        expect(elem.text()).toBe('{}');
    });

    it("should render an object with properties", function () {
        scope.value = {
            "num": 1,
            "bool": false,
            "string": "",
            "null": null,
            "obj": {},
            "arr": []
        };
        scope.$digest();
        expect(elem.text()).toBe('{"num" : 1, "bool" : false, "string" : "", "null" : null, "obj" : {}, "arr" : []}');
    });

    it("should render an empty array", function () {
        scope.value = [];
        scope.$digest();
        expect(elem.text()).toBe('[]');
    });

    it("should render an array with values", function () {
        scope.value = ["string", false, null, 1, {}, []];
        scope.$digest();
        expect(elem.text()).toBe('["string", false, null, 1, {}, []]')
    });


    it("should show editor on click with previously displayed value", function () {
        scope.value = "valueToEdit";
        scope.$digest();
        elem.dblclick();
        var find = elem.find("input[type=text]")[0];
        console.log(elem.find("input[type=text]"));
        expect(find).toBeDefined();
        expect(find.value).toBe('"valueToEdit"');
    });

    it("should send $valueChanged event when enter was pressed in editor", function () {
        scope.key = "key";
        scope.value = "valueToEdit";
        scope.$digest();
        elem.dblclick();
        var handler = jasmine.createSpy("eventHandler");
        scope.$on("$valueChanged", handler);
        var find = elem.find("input[type=text]")[0];
        find.value = '"newValue"';
        var aEvent = jQuery.Event("keydown");
        aEvent.keyCode = 13;
        $(find).trigger(aEvent);
        scope.$apply();
        expect(handler).toHaveBeenCalledWith(jasmine.any(Object),'key','newValue');
    });

    it("shouldn't fire event on ESCAPE , instead should show old value",function(){
        scope.key = "key";
        scope.value = "valueToEdit";
        scope.$digest();
        elem.dblclick();
        var handler = jasmine.createSpy("eventHandler");
        scope.$on("$valueChanged", handler);
        var find = elem.find("input[type=text]")[0];
        find.value = '"newValue"';
        var aEvent = jQuery.Event("keydown");
        aEvent.keyCode = 27;
        $(find).trigger(aEvent);
        scope.$apply();
        expect(handler).not.toHaveBeenCalled();
    });

});
