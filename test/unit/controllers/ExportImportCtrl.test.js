describe("Testing ExportImport controller", function () {
    var storageMock, prettyJsonMock, appContextMock, clipboardMock, fileSystemMock;
    var localStorageMock;
    var rootScope;
    var windowMock;
    var q;

    var ctrl, scope;
    beforeEach(module("storageExplorer"));

    beforeEach(function () {
        storageExplorer.mocks.reset();
        var methods = ['set', 'clear','get'];
        localStorageMock = jasmine.createSpyObj("storage.local", methods);
        localStorageMock.clear = storageExplorer.mocks.asyncMethodStub();
        storageMock = {
            local: localStorageMock
        };
        prettyJsonMock = jasmine.createSpy("prettyJson").andReturn("{}");
        appContextMock = jasmine.createSpy("appContext").andReturn("");
        clipboardMock = {};
        clipboardMock.put = jasmine.createSpy("put");
        clipboardMock.get = jasmine.createSpy("get");
        windowMock = {
            confirm: jasmine.createSpy("confirm").andReturn(false)
        };
        fileSystemMock = {
            promptFileDownload: jasmine.createSpy("promptFileDownload"),
            promptFileSelectionAsText: function () {
            }
        }
    });

    beforeEach(inject(function ($rootScope, $controller, $q) {
        q = $q;
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
        );

    }));

    it("should expose import export importClipboard exportClipboard", function () {
        expect(scope.import).toBeDefined();
        expect(scope.export).toBeDefined();
        expect(scope.importClipboard).toBeDefined();
        expect(scope.exportClipboard).toBeDefined();
    });

    it("on importClipboard call it should call clipboard.get, then storage.clear and storage.set", function () {
        rootScope.currentType = "local";
        clipboardMock.get.andReturn(q.when('{}'));
        scope.importClipboard();
        rootScope.$apply();
        expect(clipboardMock.get).toHaveBeenCalled();
        expect(localStorageMock.clear).toHaveBeenCalled();
        expect(localStorageMock.set).toHaveBeenCalled();
    });

    it(" should set error when parsing failed on importClipboard", function () {
        rootScope.currentType = "local";
        clipboardMock.get.andReturn(q.when('this_will_cause_error'));

        scope.importClipboard();
        rootScope.$apply();
        expect(rootScope.importError).toBeDefined();
    });

    it(" should filesystem promptFileSelectionAsText ,storage.clear storage.set on scope.import ", function () {
        spyOn(fileSystemMock, 'promptFileSelectionAsText').andReturn(q.when("{}"));
        scope.import();
        rootScope.$apply();
        expect(fileSystemMock.promptFileSelectionAsText).toHaveBeenCalled();
        expect(localStorageMock.clear).toHaveBeenCalled();
        expect(localStorageMock.set).toHaveBeenCalled();
    });

    it(" should set importError when wrong file format have been provided on scope.import",function(){
        rootScope.importError = null;
        spyOn(fileSystemMock, 'promptFileSelectionAsText').andReturn(q.when("{"));
        scope.import();
        rootScope.$apply();
        expect(rootScope.importError).toBeDefined();
    });


    it("should call storage.get and clipboard.put on scope.exportClipboard",function(){
        rootScope.currentType = "local";
        localStorageMock.get = storageExplorer.mocks.asyncMethodStub({});
        scope.exportClipboard();
        rootScope.$apply();
        expect(localStorageMock.get).toHaveBeenCalled();
        expect(clipboardMock.put).toHaveBeenCalled();
    });

    it(" should call storage.get, filesystemPromptFileDownload on scope.export",function(){
        appContextMock.andReturn(q.when({name:"name"}));
        localStorageMock.get = storageExplorer.mocks.asyncMethodStub({});
        rootScope.currentType = "local";
        scope.export();
        rootScope.$apply();

        expect(appContextMock).toHaveBeenCalled();
        expect(localStorageMock.get).toHaveBeenCalled();
        expect(fileSystemMock.promptFileDownload).toHaveBeenCalled();
    });

});