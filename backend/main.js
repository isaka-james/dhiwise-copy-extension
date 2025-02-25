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

function enableSelecting() {
    // Get all div elements with the class "monaco-editor"
    var divElements = document.querySelectorAll('.monaco-editor');

    // Iterate through each div element
    divElements.forEach(function (divElement) {
        // Check if "no-user-select" class is present
        if (divElement.classList.contains('no-user-select')) {
            // Replace "no-user-select" with "user-select"
            divElement.classList.replace('no-user-select', 'user-select');
        }
    });
}


function formatCode(code) {
    code = code.replace(/^'|'$/g, '');
    code = code.replace(/\\n/g, '\n');
    code = code.replace(/\\'/g, "'");
    code = code.replace(/\u00A0/g, ' '); 
    
    return code;
}

// Modified getAllTextContent function
function getAllTextContent(element) {
    let contentCollector = document.createElement('div');
    contentCollector.style.display = 'none';
    document.body.appendChild(contentCollector);

    const viewLines = element.querySelector('.view-lines');
    const viewport = document.querySelector('.monaco-scrollable-element');

    if (!viewLines || !viewport) {
        contentCollector.remove();
        return Promise.resolve('/* Error! No Editor */');
    }

    function captureVisibleContent() {
        const lines = viewLines.querySelectorAll('.view-line');
        let addedNew = false;

        lines.forEach(line => {
            const top = parseInt(line.style.top) || 0;
            if (!contentCollector.querySelector(`[data-top="${top}"]`)) {
                const lineElement = document.createElement('div');
                lineElement.setAttribute('data-top', top);
                lineElement.setAttribute('data-content', line.textContent || '');
                contentCollector.appendChild(lineElement);
                addedNew = true;
            }
        });

        return addedNew;
    }

    function getCollectedContent() {
        const lines = Array.from(contentCollector.children);

        const sortedLines = lines
            .map(line => ({
                top: parseInt(line.getAttribute('data-top')),
                content: line.getAttribute('data-content')
            }))
            .sort((a, b) => a.top - b.top);

        const finalContent = sortedLines.map(line => line.content).join('\n');
        contentCollector.remove();
        return finalContent;
    }

    return new Promise((resolve) => {
        viewport.scrollTop = 0;
        const maxScroll = viewport.scrollHeight;
        const stepSize = 10; 
        let prevScrollPos = -1;
        let noNewContentCount = 0;


        setTimeout(async () => {
            captureVisibleContent();

            for (let scrollPos = 0; scrollPos <= maxScroll; scrollPos += stepSize) {
                if (scrollPos === prevScrollPos) break;
                prevScrollPos = scrollPos;

                viewport.scrollTop = scrollPos;
                await new Promise(r => setTimeout(r, 50)); 

                const addedNew = captureVisibleContent();
                if (!addedNew) {
                    noNewContentCount++;
                    if (noNewContentCount > 3) {
                        break;
                    }
                } else {
                    noNewContentCount = 0;
                }
            }

            viewport.scrollTop = 0;
            const content = getCollectedContent();
            resolve(formatCode(content));
        }, 50); 
    });
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

    var divElement = document.querySelector('.monaco-scrollable-element');
    var divSideBar = document.querySelector(".pro-sidebar-layout");
    var remBtn = document.getElementById("copy-btn");

    // Check if the button exists
    if (remBtn) {
        // Remove the button from the div
        divSideBar.removeChild(remBtn);
    }

    // Create a new button element
    var button = document.createElement("button");
    button.textContent = "Copy";
    button.setAttribute('id', 'copy-btn');
    button.style.padding = "12px 18px";
    button.style.backgroundColor = "blue";
    divSideBar.appendChild(button);

    // Define the copyTextToClipboard function
    async function copyTextToClipboard(textToCopy) {
        try {
            if (navigator?.clipboard?.writeText) {
                await navigator.clipboard.writeText(textToCopy);
            }
        } catch (err) {
            console.error(err);
        }
    }

    // Add an event listener to the button
    button.addEventListener("click", async function () {
    if (document.getElementsByClassName('editorImage')[0]) {
        const imageDiv = document.querySelector('.editorImage img');
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = imageDiv.naturalWidth;
        canvas.height = imageDiv.naturalHeight;
        ctx.drawImage(imageDiv, 0, 0);
        const dataURL = canvas.toDataURL('image/png');
        const link = document.createElement('a');
        link.href = dataURL;
        link.download = getFileNameFromFocusedLi();
        link.click();
        showMessageDhiwise("Picture was downloaded Successfully!");
    } else {
        const currentDivElement = document.querySelector('.monaco-scrollable-element');
        if (currentDivElement) {
            const formattedText = await getAllTextContent(currentDivElement);
            await copyTextToClipboard(formattedText);
            showMessageDhiwise("Code was Copied Successfully!");
        } else {
            showMessageDhiwise("No content found to copy!");
        }
    }
    activate();
});
}

document.addEventListener("DOMContentLoaded", function () {
    var sectionElement = document.querySelector('section');
    sectionElement.addEventListener('click', () => {
        if (sectionElement.classList.contains('no-user-select')) {
            sectionElement.classList.remove('no-user-select');
        }
        sectionElement.classList.add('user-select');
    });
    document.div.style.userSelect = 'text';
});
