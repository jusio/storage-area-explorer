describe("Testing clipboard service", function () {

    var _clipboard;

    var _runtime;

    beforeEach(module("storageExplorer"));

    beforeEach(function () {
        _runtime = {
            sendMessage: jasmine.createSpy().andCallFake(function (message, fun) {
                fun("test")
            })
        };
        module(function ($provide) {
            $provide.value("runtime", _runtime);
        });

    });

    beforeEach(function () {
        inject(function (clipboard) {
            _clipboard = clipboard;
        });
    });


    it("Should delegate get & put to chrome.runtime.sendMessage", function () {
        _clipboard.get("", function () {
        });
        expect(_runtime.sendMessage).toHaveBeenCalled();
        _clipboard.put("", function () {
        });
        expect(_runtime.sendMessage).toHaveBeenCalled();

    });


});