// Listen for messages from the popup or other parts of the extension
chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
    // Check if the message contains a specific action
    if (message.action === "activate") {
        // Call the function defined in the content script
        activate();
    }
});





function enableCursor() {
    var targetElement = document.querySelector('.overflow-hidden.relative.h-full.false.undefined.readonlyEditor');
    if (targetElement) {
        // Remove specified classes
        targetElement.classList.remove('false', 'undefined', 'readonlyEditor');
        // Add new class
        targetElement.classList.add('h-full');
        targetElement.classList.add('true');
    }
}


function addToConfuseJs() {
    // Step 1: Select the parent element
    const parentElement = document.querySelector('div.monaco-editor');

    if (parentElement) { // Check if the parent element exists

        // Step 2: Create a new child element
        const newChildElement = document.createElement('div');
        newChildElement.className = "monaco-editor";
        newChildElement.className = "user-select";
        newChildElement.setAttribute('id', 'codes');

        // Step 3: Move all existing children of the parent into the new child
        while (parentElement.firstChild) {
            newChildElement.appendChild(parentElement.firstChild);
        }

        // Step 4: Append the new child to the parent
        parentElement.appendChild(newChildElement);
    }


}

// Get the file name from a focused li
function getFileNameFromFocusedLi() {
    // Find the <li> element with the class 'rstm-tree-item--focused'
    const focusedLi = document.querySelector('li.rstm-tree-item--focused');

    if (focusedLi) {
        // Find the <div> containing the file name
        const fileNameDiv = focusedLi.closest('div').querySelector('.text-sm.ml-1.truncate.text-high.text-dhiWhite');

        if (fileNameDiv) {
            // Get the file name text content
            const fileName = fileNameDiv.textContent.trim();
            return fileName;
        } else {
            console.error('File name div not found');
            return null;
        }
    } else {
        console.error('Focused <li> not found');
        return null;
    }
}

// JavaScript
function enableSelecting() {
    // Get all div elements with the class "monaco-editor"
    var divElements = document.querySelectorAll('.monaco-editor');

    // Iterate through each div element
    divElements.forEach(function (divElement) {
        // Check if "no-user-select" class is present
        if (divElement.classList.contains('no-user-select')) {
            // Replace "no-user-select" with "user-select"
            divElement.classList.replace('no-user-select', 'user-select');
            //alert("changed");
        }
    });

}


// Define the modified getAllTextContent function
function getAllTextContent(element) {
    let textContent = '';

    // Iterate over child nodes of the element
    for (let node of element.childNodes) {
        // If it's an element node
        if (node.nodeType === Node.ELEMENT_NODE) {
            // If it's a "view-line" element
            if (node.classList.contains('view-line')) {
                // Append its text content to the result
                textContent += node.textContent.replace(/\s/g, " ") + '\n';
            } else {
                textContent += getAllTextContent(node);
            }
        } else if (node.nodeType === Node.TEXT_NODE) {
            textContent += node.textContent.replace(/\s/g, " ");
        }
    }

    return textContent;
}

// Function to toast a message
function showMessageDhiwise(message) {
    // Create the message div
    const messageDiv = document.createElement('div');
    messageDiv.className = 'center-bottom-message';
    messageDiv.style = `
        position: fixed !important;
        bottom: 60px !important;
        left: 50% !important;
        transform: translateX(-50%) !important;
        padding: 15px 25px !important;
        background-color: #28a745 !important;
        color: #fff !important;
        border-radius: 8px !important;
        box-shadow: 0px 0px 15px rgba(0, 0, 0, 0.3) !important;
        z-index: 10000 !important;
        font-family: Arial, sans-serif !important;
        font-size: 18px !important;
        font-weight: bold !important;
        display: block !important;
        opacity: 1 !important;
        transition: opacity 0.4s ease !important;
    `;
    messageDiv.textContent = message;

    // Insert the div at the beginning of the <body>
    document.body.insertAdjacentElement('afterbegin', messageDiv);

    // Remove the div after 3 seconds
    setTimeout(() => {
        messageDiv.style.opacity = '0';
        setTimeout(() => {
            messageDiv.remove();
        }, 400); // Matches the transition duration
    }, 3000);
}



// Define the function you want to call
function activate() {
    enableCursor(); // Here we enable cursor which is disabled on the dhiwise website
    addToConfuseJs(); // we need to confuse the js that is disabling us to copy the codes
    enableSelecting(); // Enabling the selection of codes which we can copy without problem

    var allText = null;

    // chrome.runtime.sendMessage({action: "fromContentScript", data: true});


    // Get the <div> element with the specified class
    var divElement = document.querySelector('.monaco-scrollable-element');

    allText = getAllTextContent(divElement);
    //console.log(allText);


    // DELETE BEFORE STARTING
    var divSideBar = document.querySelector(".pro-sidebar-layout");

    var remBtn = document.getElementById("copy-btn");


    // Check if the button exists
    if (document.getElementById("copy-btn")) {
        // Remove the button from the div
        divSideBar.removeChild(remBtn);
    }

    // Create a new button element
    var button = document.createElement("button");


    // Set button text for code copy
    button.textContent = "Copy";

    button.setAttribute('id', 'copy-btn');

    // Add inline styles to the button
    button.style.padding = "12px 18px";
    button.style.backgroundColor = "blue";

    // Append the button to the div
    divSideBar.appendChild(button);


    // Define the copyTextToClipboard function
    async function copyTextToClipboard(textToCopy) {
        try {
            if (navigator?.clipboard?.writeText) {
                // Attempt to write text to clipboard
                await navigator.clipboard.writeText(textToCopy);

            }
        } catch (err) {
            console.error(err);
        }
    }

    // Add an event listener to the button
    button.addEventListener("click", function () {


        if (document.getElementsByClassName('editorImage')[0]) {
            const imageDiv = document.querySelector('.editorImage img');
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');

            // Set canvas dimensions to match image
            canvas.width = imageDiv.naturalWidth;
            canvas.height = imageDiv.naturalHeight;

            // Draw the image on the canvas
            ctx.drawImage(imageDiv, 0, 0);

            // Convert the canvas to a data URL
            const dataURL = canvas.toDataURL('image/png');

            // Create a link element and trigger a download
            const link = document.createElement('a');
            link.href = dataURL;
            link.download = getFileNameFromFocusedLi(); // Filename for the downloaded image
            link.click();
            showMessageDhiwise("Picture was downloaded Successfully!");
        } else {
            // Call the copyTextToClipboard function with the text to copy
            copyTextToClipboard(allText);
            showMessageDhiwise("Code was Copied Successfully!");
        }


        activate();
    });



}


document.addEventListener("DOMContentLoaded", function () {


    // Get reference to the <section> element
    var sectionElement = document.querySelector('section');


    // Add click event listener to the <section> element
    sectionElement.addEventListener('click', () => {
        // This will ensure that whenever a click occurs on the <section> element,
        // the class of the <div> element is always 'user-select'
        if (sectionElement.classList.contains('no-user-select')) {
            sectionElement.classList.remove('no-user-select');
        }
        sectionElement.classList.add('user-select');

    });


    // Ensure that the body element is always selectable
    document.div.style.userSelect = 'text';

});