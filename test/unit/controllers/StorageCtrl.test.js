describe("Testing storage controller", function () {
    var storageMock, prettyJsonMock, appContextMock, clipboardMock;
    var localStorageMock;
    var syncStorageMock;
    var rootScope;
    var windowMock;

    var ctrl, scope;
    beforeEach(module("storageExplorer"));

    beforeEach(function () {
        var methods = ['get', 'set', 'clear', 'remove', 'getMeta'];
        localStorageMock = jasmine.createSpyObj("storage.local", methods);
        localStorageMock.get.andCallFake(function (callback) {
            callback({test: "test"})
        });
        var getBytesInUse = jasmine.createSpy("getBytesInUse").andCallFake(function (firstParam, secondParam) {
            var callback;
            if (angular.isFunction(firstParam)) {
                callback = firstParam;
            } else {
                callback = secondParam;
            }

            callback(100);
        });

        syncStorageMock = jasmine.createSpyObj('storage.sync', methods);
        syncStorageMock.getBytesInUse = getBytesInUse;
        localStorageMock.getBytesInUse = getBytesInUse;
        syncStorageMock.get.andCallFake(function (callback) {
            callback({test: "test"})
        });
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
        windowMock = {
            confirm: jasmine.createSpy("confirm").andCallFake(function () {
                return false;
            })
        };
    });

    beforeEach(inject(function ($rootScope, $controller) {
        scope = $rootScope.$new();
        rootScope = $rootScope;
        ctrl = $controller('StorageCtrl', {$scope: scope,
                storage: storageMock,
                prettyJson: prettyJsonMock,
                appContext: appContextMock,
                clipboard: clipboardMock,
                $window: windowMock
            }
        )
    }));

    it("Should intialize properly", function () {
        rootScope.setType("local");
        expect(localStorageMock.getMeta).toHaveBeenCalled();
        expect(syncStorageMock.getMeta).toHaveBeenCalled();
        scope.$apply();
        expect(localStorageMock.get).toHaveBeenCalled();
        expect(localStorageMock.getBytesInUse).toHaveBeenCalled();
        expect(syncStorageMock.getBytesInUse).toHaveBeenCalled();
        expect(scope.currentType).toBe("local");
        expect(scope.results.test).toBe("test");
    });

    it("should adapt changes when storage is changed", function () {
        rootScope.$apply();
        scope.results = {
            myKey: "test",
            mySecondKey: "test2",
            unchangedKey: "unchangedValue"
        };
        rootScope.$broadcast("$storageChanged", {changes: {
            myKey: {},
            mySecondKey: {newValue: "newValue"},
            newKey: {newValue: true}
        }, type: "local"});
        expect(scope.results.myKey).not.toBeDefined();
        expect(scope.results.mySecondKey).toBe("newValue");
        expect(scope.results.newKey).toBe(true);
        expect(scope.results.unchangedKey).toBe("unchangedValue");
    });

    it("should ignore storage changes not for current storage type", function () {
        rootScope.$apply();
        scope.results = {};
        rootScope.$broadcast("$storageChanged", {changes: {
            myKey: {},
            mySecondKey: {newValue: "newValue"},
            newKey: {newValue: true}
        }, type: "sync"});
        expect(Object.keys(scope.results).length).toBe(0);
    });

    it("Should delete key when invoked", function () {
        rootScope.$apply();
        scope.delete("test");
        expect(localStorageMock.remove).toHaveBeenCalled();
    });

    it("Should ask user on clear", function () {
        rootScope.$apply();
        scope.clear();
        expect(localStorageMock.clear).not.toHaveBeenCalled();
        expect(windowMock.confirm).toHaveBeenCalled();
        windowMock.confirm = function () {
            return true;
        };
        scope.clear();
        expect(localStorageMock.clear).toHaveBeenCalled();
    });


    it("should clear value and switch to add mode on add()", function () {
        scope.add();
        expect(rootScope.mode).toBe("add");
        expect(rootScope.editObject.value).toBe('');
    });

    it("should initialized key,value  and switch to edit mode on edit()", function () {
        scope.edit("test", 1);
        expect(rootScope.mode).toBe("edit");
        expect(rootScope.editObject.key).toBe("test");
        expect(prettyJsonMock).not.toHaveBeenCalled();
        scope.edit("test", false);
        expect(prettyJsonMock).not.toHaveBeenCalled();
        scope.edit("test", "somestring");
        expect(prettyJsonMock).not.toHaveBeenCalled();
        scope.edit("test", null);
        expect(prettyJsonMock).not.toHaveBeenCalled();
        scope.edit("test", []);
        expect(prettyJsonMock).toHaveBeenCalled();
    });


});