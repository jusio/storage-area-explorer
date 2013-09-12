describe("Testing clipboard service", function () {

    var _clipboard;
    var rootScope;



    beforeEach(function () {
        resetChromeApi();
        module("storageExplorer");
        spyOn(chrome.runtime,"sendMessage").andCallFake(function(message,fun){
            fun("test")
        });

        inject(function ($rootScope,clipboard) {
            rootScope = $rootScope;
            _clipboard = clipboard;
        });
    });


    it("Should delegate get & put to chrome.runtime.sendMessage", function () {
        _clipboard.get("",function(){
        });
        expect(chrome.runtime.sendMessage).toHaveBeenCalled();
        _clipboard.put("",function(){
        });
        expect(chrome.runtime.sendMessage).toHaveBeenCalled();

    });



});