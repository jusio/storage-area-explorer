describe("Testing storage controller", function () {
    var storageMock, prettyJsonMock, appContextMock, clipboardMock;
    var localStorageMock;
    var syncStorageMock;


    var ctrl, scope;
    beforeEach(module("storageExplorer"));

    beforeEach(function () {
        var methods = ['get', 'set', 'clear', 'remove', 'getBytesInUse', 'getMeta'];
        localStorageMock = jasmine.createSpyObj("storage.local", methods);
        localStorageMock.get.andCallFake(function(callback){
            callback({test:"test"})
        });
        syncStorageMock = jasmine.createSpyObj('storage.sync', methods);
        storageMock = {
            local: localStorageMock,
            sync: syncStorageMock
        };
        prettyJsonMock = jasmine.createSpy("prettyJson");
        appContextMock = jasmine.createSpy("appContext").andCallFake(function () {
            return {appId: "id", name: "name"};
        });
        clipboardMock = {};
        clipboardMock.put = jasmine.createSpy("put");
        clipboardMock.get = jasmine.createSpy("get");
        scope = {
            $watch:function(){},
            $on:function(){}
        }

    });

    beforeEach(inject(function ($rootScope, $controller) {
        scope = $rootScope.$new();
        ctrl = $controller('StorageCtrl', {$scope: scope,
            storage: storageMock,
            prettyJson: prettyJsonMock,
            appContext: appContextMock,
            clipboard: clipboardMock})
    }));

    it("Should intialize properly", function () {
        expect(localStorageMock.getMeta).toHaveBeenCalled();
        expect(syncStorageMock.getMeta).toHaveBeenCalled();
        scope.$apply();
        expect(localStorageMock.get).toHaveBeenCalled();
        expect(localStorageMock.getBytesInUse).toHaveBeenCalled();
        expect(syncStorageMock.getBytesInUse).toHaveBeenCalled();
    });

});