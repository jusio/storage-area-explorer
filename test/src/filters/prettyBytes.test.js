describe("Testing Pretty Bytes Filter", function () {

    var prettyBytes;

    beforeEach(function () {
        module("storageExplorer");


        inject(function ($filter) {
            prettyBytes = $filter('prettyBytes');
        });
    });


    it("Should print '1byte' when 1 is passed", function () {
        expect(prettyBytes(1)).toBe("1byte");
    });

    it("Should return bytes when input > 1 and < 103", function () {
        for (var i = 2; i < 103; i++) {
            expect(prettyBytes(i)).toBe(i + "bytes");
        }
    });
    it("Should return kb when input > 103 ",function(){
       expect(prettyBytes(1024)).toBe("1kb");
    });
    it("Should return mb when input >= 1024*1024",function() {
       expect(prettyBytes(1024*1024)).toBe("1mb");
       expect(prettyBytes(1024*1024 * 1.1)).toBe("1.1mb");
    });


});