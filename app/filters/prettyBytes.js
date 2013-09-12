angular.module('storageExplorer').filter("prettyBytes", function () {

    var kbSize = 1024;
    var mbSize = 1024 * kbSize;
    return function (input) {
        if (input < +(kbSize / 10)) {
            if (input == 1) {
                return '1byte';
            }
            return input + 'bytes'
        }
        var result;
        var type;
        if (input < mbSize) {
            result = (input / kbSize);
            type = "kb"
        } else {
            result = (input / mbSize);
            type = "mb"
        }

        result = +(result.toFixed(2));

        return result + type;
    };
});
