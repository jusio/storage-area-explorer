describe("Testing appContext Service", function () {

    var injector;
    var evalService = {};
    var q;
    var chromeApi;
    beforeEach(function () {
        chromeApi = chrome.mocks.mockChromeApi();
        module("storageExplorer");
        evalService.evalFunction = jasmine.createSpy().andCallFake(function () {
            var defer = q.defer();
            defer.resolve({manifest: {name: "test"}, id: "id"});
            return defer.promise;
        });
        module(function ($provide) {

            $provide.value("evalService", evalService);

        });
        inject(function ($injector, $q) {
            injector = $injector;
            q = $q;
        });
    });


    it("On success should call evalService.evalFunction and resolve promise with results", function () {
        var callbackCalled = false;
        var appContext = injector.get('appContext');
        appContext().then(function (appInfo) {
            expect(appInfo.name).toBe("test");
            expect(appInfo.id).toBe("id");
            callbackCalled = true;
        });

        var $rootScope = injector.get('$rootScope');
        $rootScope.$apply();
        expect(callbackCalled).toBeTruthy();
        expect(evalService.evalFunction).toHaveBeenCalled();
        evalService.evalFunction = null;
        spyOn(evalService, 'evalFunction');
        appContext().then(function (appInfo) {
            expect(appInfo.name).toBe("test");
            expect(appInfo.id).toBe("id");
            callbackCalled = true;
        });
        expect(callbackCalled).toBeTruthy();
        expect(evalService.evalFunction).not.toHaveBeenCalled();

    });

    it("On evalService.evalFunction fail should call promise reject", function () {

        evalService.evalFunction = function (fnc) {
            var defer = q.defer();
                fnc(chromeApi);
            defer.reject();
            return defer.promise;
        };
        var callbackCalled = false;
        injector.get('appContext')().then(function () {
        }, function () {
            callbackCalled = true;
        });
        injector.get('$rootScope').$apply();
        expect(callbackCalled).toBeTruthy();
        spyOn(evalService, 'evalFunction');
        callbackCalled = false;
        injector.get('appContext')().then(function () {
        }, function () {
            callbackCalled = true;
        });
        injector.get('$rootScope').$apply();
        expect(callbackCalled).toBeTruthy();
        expect(evalService.evalFunction).not.toHaveBeenCalled();

    });


});