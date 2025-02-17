// Listen for messages from the popup or other parts of the extension
chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
    if (message.action === "activate") {
        activate();
    }
});

function enableCursor() {
    var targetElement = document.querySelector('.overflow-hidden.relative.h-full.false.undefined.readonlyEditor');
    if (targetElement) {
        targetElement.classList.remove('false', 'undefined', 'readonlyEditor');
        targetElement.classList.add('h-full', 'true');
    }
}

function addToConfuseJs() {
    const parentElement = document.querySelector('div.monaco-editor');
    if (parentElement) {
        const newChildElement = document.createElement('div');
        newChildElement.className = "monaco-editor user-select";
        newChildElement.setAttribute('id', 'codes');

        while (parentElement.firstChild) {
            newChildElement.appendChild(parentElement.firstChild);
        }
        parentElement.appendChild(newChildElement);
    }
}

function getFileNameFromFocusedLi() {
    const focusedLi = document.querySelector('li.rstm-tree-item--focused');
    if (focusedLi) {
        const fileNameDiv = focusedLi.closest('div').querySelector('.text-sm.ml-1.truncate.text-high.text-dhiWhite');
        if (fileNameDiv) {
            return fileNameDiv.textContent.trim();
        }
    }
    return null;
}

function enableSelecting() {
    var divElements = document.querySelectorAll('.monaco-editor');
    divElements.forEach(function (divElement) {
        if (divElement.classList.contains('no-user-select')) {
            divElement.classList.replace('no-user-select', 'user-select');
        }
    });
}

function getAllTextContent(element) {
    let textContent = '';
    for (let node of element.childNodes) {
        if (node.nodeType === Node.ELEMENT_NODE) {
            if (node.classList.contains('view-line')) {
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

function showMessageDhiwise(message) {
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
    document.body.insertAdjacentElement('afterbegin', messageDiv);

    setTimeout(() => {
        messageDiv.style.opacity = '0';
        setTimeout(() => {
            messageDiv.remove();
        }, 400);
    }, 3000);
}

function showDownloadPrompt(textToCopy, fileName) {
    const promptDiv = document.createElement('div');
    promptDiv.style = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background-color: rgba(255, 0, 0, 0.9);
        padding: 20px;
        border-radius: 8px;
        box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        z-index: 10001;
        text-align: center;
    `;

    promptDiv.innerHTML = `
    <div>
       <p style="margin-bottom: 20px;">Would you like to download this code as well?</p>
        <button id="download-yes" style="margin-right: 10px; padding: 8px 16px; background-color: #28a745; color: white; border: none; border-radius: 4px; cursor: pointer;">Yes</button>
        <button id="download-no" style="padding: 8px 16px; background-color: #dc3545; color: white; border: none; border-radius: 4px; cursor: pointer;">No</button>
        </div>
    `;

    document.body.appendChild(promptDiv);

    document.getElementById('download-yes').addEventListener('click', () => {
        const blob = new Blob([textToCopy], { type: "text/plain" });
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        showMessageDhiwise("Code Downloaded as " + fileName);
        document.body.removeChild(promptDiv);
    });

    document.getElementById('download-no').addEventListener('click', () => {
        document.body.removeChild(promptDiv);
    });
}

async function copyTextToClipboard(textToCopy) {
    try {
        if (navigator?.clipboard?.writeText) {
            await navigator.clipboard.writeText(textToCopy);
            showMessageDhiwise("Code Copied Successfully!");

            // Get filename or use default
            const fileName = getFileNameFromFocusedLi() || "copied_code.txt";

            // Show download prompt instead of auto-downloading
            showDownloadPrompt(textToCopy, fileName);
        }
    } catch (err) {
        console.error(err);
        showMessageDhiwise("Failed to copy code");
    }
}

function activate() {
    enableCursor();
    addToConfuseJs();
    enableSelecting();

    var divElement = document.querySelector('.monaco-scrollable-element');
    var allText = getAllTextContent(divElement);
    var divSideBar = document.querySelector(".pro-sidebar-layout");
    var remBtn = document.getElementById("copy-btn");

    if (remBtn) {
        divSideBar.removeChild(remBtn);
    }

    var button = document.createElement("button");
    button.textContent = "Copy";
    button.setAttribute('id', 'copy-btn');
    button.style.padding = "12px 18px";
    button.style.backgroundColor = "blue";
    button.style.color = "white";
    button.style.border = "none";
    button.style.borderRadius = "4px";
    button.style.cursor = "pointer";
    divSideBar.appendChild(button);

    button.addEventListener("click", function () {
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
            link.download = getFileNameFromFocusedLi() || 'image.png';
            link.click();
            showMessageDhiwise("Picture was downloaded Successfully!");
        } else {
            copyTextToClipboard(allText);
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