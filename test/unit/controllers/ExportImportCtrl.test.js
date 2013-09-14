describe("Testing ExportImport controller", function () {
    var storageMock, prettyJsonMock, appContextMock, clipboardMock, fileSystemMock;
    var localStorageMock;
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

        localStorageMock.getBytesInUse = getBytesInUse;
        storageMock = {
            local: localStorageMock
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
        fileSystemMock = {
            promptFileDownload:function(){},
            promptFileSelectionAsText:function(){}
        }
    });

    beforeEach(inject(function ($rootScope, $controller) {
        scope = $rootScope.$new();
        rootScope = $rootScope;
        rootScope.currentType = "local";
        ctrl = $controller('ExportImportCtrl', {$scope: scope,
                storage: storageMock,
                prettyJson: prettyJsonMock,
                appContext: appContextMock,
                clipboard: clipboardMock,
                $window: windowMock,
                fileSystem: fileSystemMock
            }
        )
    }));

});