if (!storageExplorer) {
    var storageExplorer = {};
}
storageExplorer.mocks = {
    reset: function () {
        storageExplorer.mocks.asyncMethodStub = function (invokeWith) {
            return jasmine.createSpy().andCallFake(
                function () {
                    for (var i = 0; i < arguments.length; i++) {
                        if (typeof arguments[i] === 'function') {
                            arguments[i]();
                            return;
                        }
                    }
                });
        }
    }

};