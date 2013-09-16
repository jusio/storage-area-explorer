(function(){
    var module = angular.module("options", []);
    module.controller("OptionsCtrl",function($scope){
        $scope.installDHC = function(){
            chrome.webstore.install("https://chrome.google.com/webstore/detail/aejoelaoggembcahagimdiliamlcdmfm",function(){
                console.log("installed")
            },function(e){
                console.log(e);
            })
        };
    });
})();




