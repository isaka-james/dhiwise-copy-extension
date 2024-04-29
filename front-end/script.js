document.addEventListener("DOMContentLoaded", function() {
    var switchLabels = document.querySelectorAll('.switch__label');
    var checkbox = document.getElementById("switch__checkbox");
  
    switchLabels.forEach(function(label) {
      label.addEventListener('click', function() {

        checkbox.addEventListener('change', function() {
            // Check if the checkbox is checked
            if (checkbox.checked) {
                console.log("checked");
                document.getElementById("head").style.color = "white";
                

                chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
                    chrome.tabs.sendMessage(tabs[0].id, {action: "activate"});
                });

            } else {
                console.log("unchecked");
                document.getElementById("head").style.color = "black";
            }
        });

        document.body.classList.toggle('switch-bg');
        document.querySelector('.switch').classList.toggle('switch-border');
      });
    });
  });


// Listen for messages from content scripts or other parts of the extension
chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
    // Check if the message contains a specific action
    if (message.action === "fromContentScript") {
        // Handle the message from the content script
        console.log("Message received from content script: ", message.data);
    }
});