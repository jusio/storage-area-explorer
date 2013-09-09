angular.module('storageExplorer').filter("prettyBytes", function () {

    var kbSize = 1024;
    var mbSize = 1024 * kbSize;
    return function (input) {
        if (input < kbSize) {
            if (input == 1) {
                return '1 byte';
            }
            return input + ' bytes'
        }
        if (input < mbSize) {
             return (input / kbSize).toFixed(2) + " kb";
        }

        return (input / mbSize).toFixed(2) + " mb";


    };
});
