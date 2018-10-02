let win = require('electron').remote.getCurrentWindow();
const path = require('path');
const url = require('url');
const remote = require('electron').remote;
const clipboard = require('electron').clipboard;
let app = undefined;
if (remote !== undefined) app = remote.app;
let ipcRenderer = require('electron').ipcRenderer;
const openAboutWindow = require('about-window').default;

let dialog = undefined;
let renameOld = "";
let selectedForDelete = "";
let idleTime = 0;

/**
 * Go to add.html
 */
function toAdd() {
    win.loadURL(url.format({
        pathname: path.join(__dirname, '../add/add.html'),
        protocol: 'file:',
        slashes: true
    }));
}

/**
 * Go to settings.html
 */
function openSettings() {
    win.loadURL(url.format({
        pathname: path.join(__dirname, '../settings/settings.html'),
        protocol: 'file:',
        slashes: true
    }));
}

/**
 * Open about window
 */
function openAbout() {
    openAboutWindow({
        icon_path: '../../img/icon300x300.png',
        copyright: 'Copyright(c) 2018 Nikolas Eller',
        homepage: 'https://github.com/Nikolasel/EAuthenticator',
        description: 'An Electron Desktop app compatible with Google Authenticator',
        license: 'GPL-3.0',
    });
}

/**
 * Checks if data is encrypted
 */
function init() {
    let needPassword = ipcRenderer.sendSync('needPassword');
    let noFileFound = ipcRenderer.sendSync('noFileFound');

    if(noFileFound) {
        dialog = document.getElementById("dialog-new-password");
        dialog.showModal();
    } else if (needPassword) {
        //Set Password
        dialog = document.getElementById("dialog-decrypt");
        dialog.showModal();
    } else {
        showAccounts();
    }
}

/**
 * Displays the accounts from storage
 */
function showAccounts() {
    //determine lock environment
    setupLock();
    let list = document.getElementById("list-of-accounts");
    let accounts = ipcRenderer.sendSync('getAllAccounts');
    let pins = [];
    let times = [];
    if (accounts.length === 0) {
        //Help to add new Account
        //alert("Empty: " + app.getPath("userData"));
    } else {
        for (let i = 0; i < accounts.length; i++) {
            let listItem = document.createElement('li');
            listItem.className += " mdl-list__item";

            let span = document.createElement('span');
            span.className += " mdl-list__item-primary-content mdl-color-text--blue-grey-400";
            let name = accounts[i].name;
            span.innerHTML = name;
            listItem.appendChild(span);

            let spanPin = document.createElement('span');
            spanPin.className += " list-pin";
            let spanTimer = document.createElement('span');
            spanTimer.className += " list-time";
            spanTimer.innerHTML = "...";
            listItem.appendChild(spanPin);
            listItem.appendChild(spanTimer);

            let spanEnd = document.createElement('span');
            spanEnd.className += " mdl-list__item-secondary-action";
            let btnCopy = document.createElement('button');
            btnCopy.className += " mdl-button mdl-js-button mdl-button--icon";
            btnCopy.innerHTML = "<div id='copyButton" + i + "' class='icon material-icons mdl-color-text--blue-grey-400 button-no-focus-style'>content_copy</div>" +
                                "<div class='mdl-tooltip capa' data-mdl-for='copyButton" + i + "'>Copy password</div>";
            btnCopy.addEventListener("click", function() {
                clipboard.writeText(spanPin.innerText.replace(" ", ""));
                new Notification('EAuthenticator', {
                    body: 'Copied password to clipboard!'
                })
            }, false);
            let btnRename = document.createElement('button');
            btnRename.className += " mdl-button mdl-js-button mdl-button--icon";
            btnRename.innerHTML = "<div id='renameButton" + i + "' class='icon material-icons mdl-color-text--blue-grey-400 button-no-focus-style'>create</div>" +
                "<div class='mdl-tooltip capa' data-mdl-for='renameButton" + i + "'>Rename account</div>";
            btnRename.addEventListener("click", function() {
                showRenameAccount(name);
            }, false);
            let btnDelete = document.createElement('button');
            btnDelete.className += " mdl-button mdl-js-button mdl-button--icon";
            btnDelete.innerHTML = "<div id='deleteButton" + i + "' class='icon material-icons mdl-color-text--blue-grey-400 button-no-focus-style'>delete</div>" +
                "<div class='mdl-tooltip capa' data-mdl-for='deleteButton" + i + "'>Delete account</div>";
            btnDelete.addEventListener("click", function() {
                showDeleteAccount(name);
            }, false);
            spanEnd.appendChild(btnCopy);
            spanEnd.appendChild(btnRename);
            spanEnd.appendChild(btnDelete);

            listItem.appendChild(spanEnd);
            list.appendChild(listItem);
            list.appendChild(document.createElement('hr'));
            pins.push(spanPin);
            times.push(spanTimer);
        }
        componentHandler.upgradeDom();
        updatePin(accounts, pins);
        updateChart(getSecUntil30(), times);
        window.setTimeout(function () {
            window.setInterval(function () {
                updateAll(times, accounts, pins);
            }, 1000)
        }, getMSUntilFullSecond());

    }
}

/**
 * Updates the current time to next one-time password
 * @param times dom object for displaying the time
 * @param accounts
 * @param pins dom object for displaying the pin
 */
function updateAll(times, accounts, pins) {
    let seconds = getSecUntil30();
    if (seconds === 30) {
        let newAccounts = ipcRenderer.sendSync('getAllAccounts');
        updatePin(newAccounts, pins);
    }
    updateChart(seconds, times);
}

/**
 * Updates the chart with the current seconds
 * @param seconds current seconds
 * @param times elements for chart
 */
function updateChart(seconds, times) {
    for (let i = 0; i < times.length; i++) {
        makeChart(seconds, times[i]);
    }
}

/**
 * Update the one-time passwords
 * @param accounts
 * @param accountsMid dom object for displaying the pin
 */
function updatePin(accounts, accountsMid) {
    for (let i = 0; i < accounts.length; i++) {
        accountsMid[i].innerHTML = accounts[i].pin;
    }
}

/**
 * Returns ms until complete second
 * @return {number}
 */
function getMSUntilFullSecond() {
    let time = new Date();
    return 1000 - time.getMilliseconds()
}


/**
 * Returns time until next pin update
 * @returns {number}
 */
function getSecUntil30() {
    let time = new Date();
    let seconds = time.getSeconds();
    if (seconds >= 30) {
        return (60 - seconds);
    } else {
        return (30 - seconds);
    }
}

/**
 * Updates the time chart
 * @param time
 * @param object
 */
function makeChart(time, object) {
    //Chart.js
    let canvas = document.createElement('canvas');
    canvas.height = 50;
    canvas.width = 50;
    canvas.id = "chart";
    let filled = Math.round(time / 30 * 100);
    let unfilled = 100 - filled;
    let config = {
        type: 'pie',
        data: {
            datasets: [{
                data: [
                    unfilled,
                    filled
                ],
                backgroundColor: [
                    'transparent',
                    '#2196f3',
                ],
                label: ''
            }],
            labels: [
            ]
        },
        options: {
            responsive: false,
            animation: false,
            tooltips: {enabled: false},
            hover: {mode: null},
        }
    };

    let ctx = canvas.getContext("2d");
    new Chart(ctx, config);
    object.innerHTML = '';
    object.appendChild(canvas);
}

/**
 * Shows dialog for renaming a account
 * @param name
 */
function showRenameAccount(name) {
    dialog = document.getElementById("dialog-rename");
    let inputContainer = document.getElementById("container-rename");
    inputContainer.className += ' is-dirty';
    let input = document.getElementById("input-rename");
    input.value = name;
    renameOld = name;
    dialog.showModal();
}

/**
 * Shows dialog for deleting a account
 * @param name
 */
function showDeleteAccount(name) {
    let header = document.getElementById("delete-header");
    let str = header.innerHTML;
    let newHeader = str.replace("...", name);
    header.innerHTML = newHeader;
    selectedForDelete = name;
    dialog = document.getElementById("dialog-delete");
    dialog.showModal();
}

/**
 * Close current dialog
 */
function closeDialog() {
    if(dialog !== undefined) {
        dialog.close();
    }
}

/**
 * Saves the renaming to storage
 */
function saveRename() {
    let newName = document.getElementById("input-rename").value;
    try {
        let resultRename = ipcRenderer.sendSync("renameAccount", {name: renameOld, newName: newName});
        checkIPCMessage(resultRename);
        closeDialog();
        remote.getCurrentWindow().reload();
    }
    catch (e) {
        let error = document.getElementById('renameError');
        error.parentElement.className += ' is-invalid';
        error.textContent = e.message;
    }
}

/**
 * Saves the deleting to storage
 */
function deleteAccount() {
    try {
        let resultDelete = ipcRenderer.sendSync("deleteAccount", {name: selectedForDelete});
        checkIPCMessage(resultDelete);
        closeDialog();
        remote.getCurrentWindow().reload();
    }
    catch (e) {
        alert(e.message);
    }
}

/**
 * Tries to decrypt with the current password
 */
function tryDecrypt() {
    let input = document.getElementById("input-decrypt");
    let key = input.value;
    let error = document.getElementById('decryptError');
    try {
        let resultDecrypt = ipcRenderer.sendSync("unlockFile", {password: key});
        checkIPCMessage(resultDecrypt);
        showAccounts();
        closeDialog();
    }
    catch (e) {
        if (e !== "Invalid data") {
            error.parentElement.className += ' is-invalid';
            error.textContent = "Password invalid";
        } else {
            alert(e.message);
        }
    }
}

/**
 * Saves the password to the storage
 */
function savePassword() {
    let newPasswordFirstEle = document.getElementById('input-password1');
    let newPasswordSecondEle = document.getElementById('input-password2');
    let newPasswordFirst = newPasswordFirstEle.value;
    let newPasswordSecond = newPasswordSecondEle.value;
    let bool = false;
    if(newPasswordFirst === "") {
        let newError = document.getElementById('passwordError1');
        newError.parentElement.className += ' is-invalid';
        newError.textContent = "Password must be filled!";
        bool = true;
    }
    if(newPasswordSecond === "") {
        let newError = document.getElementById('passwordError2');
        newError.parentElement.className += ' is-invalid';
        newError.textContent = "Password must be filled!";
        bool = true;
    }
    if(bool) return;
    if(newPasswordFirst === newPasswordSecond) {
        try {
            let resultDecrypt = ipcRenderer.sendSync("changePassword", {
                oldPassword: 'defaultPassword',
                newPassword: newPasswordFirst
            });
            checkIPCMessage(resultDecrypt);
            newPasswordFirstEle.value = "";
            newPasswordSecondEle.value = "";
            newPasswordSecondEle.parentElement.classList.remove("is-dirty");
            newPasswordFirstEle.parentElement.classList.remove("is-dirty");
            closeDialog();
            showAccounts();
        } catch (e) {
            alert(e.message);
        }
    } else {
        let newError = document.getElementById('passwordError2');
        newError.parentElement.className += ' is-invalid';
        newError.textContent = "Passwords are not equivalent!";
    }
}

function lockApp() {
    try {
        let result = ipcRenderer.sendSync('lockFile');
        checkIPCMessage(result);
        remote.getCurrentWindow().reload();
    }
    catch (e) {
        alert(e.message);
    }
}

/**
 * Check the ipc message
 * @param message result message
 * @throws error, if message contains one
 */
function checkIPCMessage(message) {
    if(message.status !== 200) {
        throw Error(message.error);
    }
}

/**
 * Auto locks the app after 5 minutes
 */
function idleLock() {
    window.onload = resetTimer;
    window.onmousemove = resetTimer;
    window.onmousedown = resetTimer; // catches touchscreen presses
    window.onclick = resetTimer;     // catches touchpad clicks
    window.onscroll = resetTimer;    // catches scrolling with arrow keys
    window.onkeypress = resetTimer;


    function resetTimer() {
        clearTimeout(idleTime);
        idleTime = setTimeout(lockApp, 300000);  // time is in milliseconds
    }
}

/**
 * Activate the auto lock
 */
function setupLock() {
    let defaultPassword = ipcRenderer.sendSync('useDefaultPassword');
    if(defaultPassword) {
        //deactivate lock button mdl-button--disabled
        let lockButton = document.getElementById("appLocker");
        lockButton.className += ' mdl-button--disabled';
        lockButton.disabled = true;
        let lockText = document.getElementById("lockerText");
        lockText.innerText = "Lock App Disabled"
    } else {
        //set auto idle lock
        idleLock();
    }
}

/**
 * Handle enter on decrypt
 * @param event
 * @return {boolean}
 */
function handleKeypressEvent(event) {
    if (event.keyCode === 13) {
        tryDecrypt();
        return false;
    }
}