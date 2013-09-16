describe("pretty json test", function () {
    var prettyJsonInst;
    beforeEach(function () {
        module('storageExplorer');
        inject(function (prettyJson) {
            prettyJsonInst = prettyJson;
        });
    });

    it("Should parse json correctly", function () {
        var obj = {
            "null": null,
            "number": 1,
            "floatNumber": 1.2,
            "boolean": false,
            "boolean2": false,
            "array": [1,false,null,true,{},[]],
            "obj": {},
            "string":"string"
        };

        var prettyJsonString = prettyJsonInst(obj);
        var parsed = JSON.parse(prettyJsonString);

        function compareObj(source, target) {
            Object.keys(source).forEach(function (key) {
                if (angular.isObject(source[key])) {
                    compareObj(source[key],target[key]);
                    return;
                }
                expect(parsed[key]).toBe(obj[key]);
            });
        }
        compareObj(obj,parsed);
    });

    it("Should not ignore $$hashKey",function(){
        expect(JSON.parse(prettyJsonInst({"$$hashKey":true}))["$$hashKey"]).toBe(true);
    });

    afterEach(function(){
        resetChromeApi();
    })
});