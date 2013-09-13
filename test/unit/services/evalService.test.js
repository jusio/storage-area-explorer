describe("Testing evalService", function () {


    var _devtools;
    var _evalService;
    var rootScope;

    beforeEach(module("storageExplorer"));

    beforeEach(function () {
        _devtools = {
            inspectedWindow: {
                eval: function () {
                }
            }
        };
        module(function ($provide) {
            $provide.value("devtools", _devtools);
        });

    });

    beforeEach(function () {
        inject(function (evalService, $rootScope) {
            _evalService = evalService;
            rootScope = $rootScope;
        });
    });


    it("Should correctly resolve promise on success and on error", function () {
        var expectedResult = {};
        var inputString;
        _devtools.inspectedWindow.eval = function (input, fnc) {
            fnc(expectedResult);
            inputString = input;
            console.log(fnc)
        };
        var obtainedResult;
        _evalService.evalFunction("").then(function (result) {
            obtainedResult = result;
        }, function () {
            console.log("Error");
        });
        rootScope.$apply();
        expect(inputString).toBe("()(chrome)");
        expect(obtainedResult).toBe(expectedResult);
        _devtools.inspectedWindow.eval = function (input, fnc) {
            fnc(null, true);
        };
        var spy = jasmine.createSpy("callback");
        _evalService.evalFunction("").then(function () {
        }, spy);
        rootScope.$apply();
        expect(spy).toHaveBeenCalled();
    });

    it("Should inject parameters", function () {
        var params = {PARAM: "PARAM_VALUE"};
        spyOn(_devtools.inspectedWindow, 'eval').andCallFake(function (closure, callback) {
            expect(closure).toBe("(PARAM_VALUE)(chrome)");
            callback();
        });
        var callback = jasmine.createSpy("callback");
        _evalService.evalFunction("PARAM", params).then(callback);
        rootScope.$apply();
        expect(_devtools.inspectedWindow.eval).toHaveBeenCalled();
        expect(callback).toHaveBeenCalled();

    });


});