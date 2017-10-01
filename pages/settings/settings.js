let app = require('electron').remote.app;
let ipcRenderer = require('electron').ipcRenderer;
let storageOldData = ipcRenderer.sendSync('get-storage');
let Storage = require('../../lib/storage');
let storage = new Storage(app, storageOldData, true);

let dialog = undefined;

function init() {
    let headerPassword = document.getElementById("header-password");
    if(storage.isDataEncrypted()) {
        headerPassword.innerHTML = "Change Password";
        let oldPass = document.getElementById("old-password");
        oldPass.style.display = 'block';
        let removeEncBtn = document.getElementById("remove-encryption-button");
        removeEncBtn.style.display = 'inline';
    } else {
        headerPassword.innerHTML = "Add Password";
    }
}

function savePassword() {
    //Check old password
    let inputOldPasswordEle = document.getElementById('input-old');
    if(storage.isDataEncrypted()) {
        let secretError = document.getElementById('oldPasswordError');
        let inputOldPassword = inputOldPasswordEle.value;
        if(inputOldPassword !== storage.getKey()) {
            secretError.parentElement.className += ' is-invalid';
            secretError.textContent = "Password invalid!";
            return;
        }
    }
    //Check new passwords are equivalent
    let newPasswordFirstEle = document.getElementById('input-new-first');
    let newPasswordSecondEle = document.getElementById('input-new-second');
    let newPasswordFirst = newPasswordFirstEle.value;
    let newPasswordSecond = newPasswordSecondEle.value;
    if(newPasswordFirst === newPasswordSecond) {
        storage.setNewKey(newPasswordFirst);
        let serialize = storage.serialize();
        ipcRenderer.send('update-storage', serialize);
        newPasswordFirstEle.value = "";
        newPasswordSecondEle.value = "";
        inputOldPasswordEle.value = "";
        newPasswordSecondEle.parentElement.classList.remove("is-dirty");
        newPasswordFirstEle.parentElement.classList.remove("is-dirty");
        inputOldPasswordEle.parentElement.classList.remove("is-dirty");
        dialog = document.getElementById("dialog-successful");
        dialog.showModal();
        let oldPass = document.getElementById("old-password");
        oldPass.style.display = 'block';
        let headerPassword = document.getElementById("header-password");
        headerPassword.innerHTML = "Change Password";
        let removeEncBtn = document.getElementById("remove-encryption-button");
        removeEncBtn.style.display = 'inline';
    } else {
        let newError = document.getElementById('newSecondPasswordError');
        newError.parentElement.className += ' is-invalid';
        newError.textContent = "Passwords are not equivalent!";
    }
}

function closeDialog() {
    if(dialog !== undefined) {
        dialog.close();
    }
}

function removeEncryption() {
    let newPasswordFirstEle = document.getElementById('input-new-first');
    let newPasswordSecondEle = document.getElementById('input-new-second');
    let inputOldPasswordEle = document.getElementById('input-old');
    let secretError = document.getElementById('oldPasswordError');
    let inputOldPassword = inputOldPasswordEle.value;
    if(inputOldPassword !== storage.getKey()) {
        secretError.parentElement.className += ' is-invalid';
        secretError.textContent = "To remove encryption you need to type in your password";
    } else {
        storage.removeEncryption();
        let serialize = storage.serialize();
        ipcRenderer.send('update-storage', serialize);
        newPasswordFirstEle.value = "";
        newPasswordSecondEle.value = "";
        inputOldPasswordEle.value = "";
        newPasswordSecondEle.parentElement.classList.remove("is-dirty");
        newPasswordFirstEle.parentElement.classList.remove("is-dirty");
        inputOldPasswordEle.parentElement.classList.remove("is-dirty");
        dialog = document.getElementById("dialog-successful");
        dialog.showModal();
        let oldPass = document.getElementById("old-password");
        oldPass.style.display = 'none';
        let headerPassword = document.getElementById("header-password");
        headerPassword.innerHTML = "Add Password";
        let removeEncBtn = document.getElementById("remove-encryption-button");
        removeEncBtn.style.display = 'none';
    }
}

function checkTime() {
    let Sntp = require('sntp');
    let options = {
        host: 'time.google.com',  // Defaults to pool.ntp.org
        port: 123,                      // Defaults to 123 (NTP)
        resolveReference: true,         // Default to false (not resolving)
        timeout: 100                   // Defaults to zero (no timeout)
    };
    Sntp.time(options, function (err, time) {

        dialog = document.getElementById("dialog-time");
        dialog.showModal();
        let timeMessage = document.getElementById("text-time");
        if (err) {
            timeMessage.innerHTML = 'Failed: ' + err.message;
            return;
        }
        if(time.t > 100 ) {
            let sec = Math.round((time.t / 1000) * 10) / 10;
            timeMessage.innerHTML = "Your clock is " + sec + " seconds behind";
            return;
        }
        if(time.t < -100) {
            let sec = Math.round(Math.abs(time.t / 1000) * 10) / 10;
            timeMessage.innerHTML =  "Your clock is " + sec + " seconds ahead";
            return;
        }
        timeMessage.innerHTML = "Your time ist good enough";


    });
}