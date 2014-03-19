describe("Testing AddEditItem controller", function () {
    var storageMock;
    var localStorageMock;
    var syncStorageMock;
    var rootScope;
    var editObject;

    var ctrl, scope;
    beforeEach(module("storageExplorer"));

    beforeEach(function () {
        var methods = ['get', 'set', 'clear', 'remove', 'getMeta'];
        localStorageMock = jasmine.createSpyObj("storage.local", methods);
        syncStorageMock = jasmine.createSpyObj('storage.sync', methods);
        storageMock = {
            local: localStorageMock,
            sync: syncStorageMock
        };
    });

    beforeEach(inject(function ($rootScope, $controller) {
        scope = $rootScope.$new();
        rootScope = $rootScope;
        editObject = rootScope.editObject = {};
        rootScope.currentDescriptor = {stringOnly:false};
        rootScope.currentType = "local";
        ctrl = $controller('AddEditItemCtrl', {$scope: scope,
                storage: storageMock
            }
        )
    }));


    it("Should call set on save()", function () {
        rootScope.editObject.key = "mykey";
        rootScope.editObject.value = '{"test":false}';
        rootScope.$apply();
        localStorageMock.set = function (object, callback) {
            callback();
        };
        spyOn(scope, "cancel");
        scope.save();
        expect(scope.cancel).toHaveBeenCalled();
    });

    it("should switch to list mode on cancel and clear value", function () {
        rootScope.$apply();
        scope.cancel();
        expect(rootScope.mode).toBe("list");
        expect(editObject.value).toBeUndefined();
        expect(editObject.key).toBeUndefined();
    });

    it("Should set exception on fail", function () {
        editObject.key = "asd";
        editObject.value = "invalidJson";
        rootScope.$apply();
        expect(scope.validation).toBeDefined();
    });

});