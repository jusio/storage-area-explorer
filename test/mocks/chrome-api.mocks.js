function resetChromeApi() {

    chrome.runtime = {
        sendMessage: function () {

        }

    };
    chrome.devtools = {
        inspectedWindow: {
            "eval": function () {

            }
        }
    }
}
resetChromeApi();
