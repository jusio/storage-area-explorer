describe("Testing appContext Service", function () {

    var injector;


    beforeEach(function () {
        resetChromeApi();

        module("storageExplorer");
        inject(function ($injector) {
            injector = $injector;
        });

    });


    it("Should call inspectedWindow.eval and resolve promise with results", function () {
        spyOn(chrome.devtools.inspectedWindow,'eval').andCallFake(function(param,func){
            func({manifest:{name:"test"},id:"id"},false);
        });
        var callbackCalled = false;
        injector.get('appContext')().then(function(appInfo){
            expect(appInfo.name).toBe("test");
            expect(appInfo.id).toBe("id");
            callbackCalled = true;
        });
        injector.get('$rootScope').$apply();
        expect(callbackCalled).toBeTruthy();
        expect(chrome.devtools.inspectedWindow.eval).toHaveBeenCalled();
    });

});