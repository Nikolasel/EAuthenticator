/*
* An Electron Desktop app compatible with Google Authenticator.
* Copyright (C) 2018  Nikolas Eller

* This program is free software: you can redistribute it and/or modify
* it under the terms of the GNU General Public License as published by
* the Free Software Foundation, either version 3 of the License, or
* (at your option) any later version.

* This program is distributed in the hope that it will be useful,
* but WITHOUT ANY WARRANTY; without even the implied warranty of
* MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
* GNU General Public License for more details.

* You should have received a copy of the GNU General Public License
* along with this program. If not, see <http://www.gnu.org/licenses/>.
*/

let ipcRenderer = require('electron').ipcRenderer;
let Sntp = require('sntp');
let win = require('electron').remote.getCurrentWindow();
const path = require('path');
const url = require('url');

let dialog = undefined;
let useDefaultPassword;

/**
 * Checks if data is encrypted and makes structure depending on it
 */
function init() {
    let headerPassword = document.getElementById("header-password");
    useDefaultPassword = ipcRenderer.sendSync('useDefaultPassword');
    if(!useDefaultPassword) {
        headerPassword.innerHTML = "Change Password";
        let oldPass = document.getElementById("old-password");
        oldPass.style.display = 'block';
        let removeEncBtn = document.getElementById("remove-encryption-button");
        removeEncBtn.style.display = 'inline';
    } else {
        headerPassword.innerHTML = "Add Password";
    }
}

/**
 * Saves a new password
 */
function savePassword() {
    //Check new passwords are equivalent
    let newPasswordFirstEle = document.getElementById('input-new-first');
    let newPasswordSecondEle = document.getElementById('input-new-second');
    let newPasswordFirst = newPasswordFirstEle.value;
    let newPasswordSecond = newPasswordSecondEle.value;
    let bool = false;
    if(newPasswordFirst === "") {
        let newError = document.getElementById('newFirstPasswordError');
        newError.parentElement.className += ' is-invalid';
        newError.textContent = "Password must be filled!";
        bool = true;
    }
    if(newPasswordSecond === "") {
        let newError = document.getElementById('newSecondPasswordError');
        newError.parentElement.className += ' is-invalid';
        newError.textContent = "Password must be filled!";
        bool = true;
    }
    if(bool) return;
    if(newPasswordFirst === newPasswordSecond) {
        try {
            //old password
            let oldPassword;
            let inputOldPasswordEle = document.getElementById('input-old');
            if (useDefaultPassword) {
                oldPassword = 'defaultPassword';
            } else {
                oldPassword = inputOldPasswordEle.value;
            }
            let result = ipcRenderer.sendSync('changePassword', {oldPassword: oldPassword, newPassword: newPasswordFirst});
            checkIPCMessage(result);
            useDefaultPassword = false;
            //Set DOM
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
        } catch (e) {
            let secretError = document.getElementById('oldPasswordError');
            secretError.parentElement.className += ' is-invalid';
            secretError.textContent = e.message;
        }
    } else {
        let newError = document.getElementById('newSecondPasswordError');
        newError.parentElement.className += ' is-invalid';
        newError.textContent = "Passwords are not equivalent!";
    }
}

/**
 * Close the current dialog
 */
function closeDialog() {
    if(dialog !== undefined) {
        dialog.close();
    }
}

/**
 * Removes the encryption of accounts
 */
function resetEncryption() {
    let newPasswordFirstEle = document.getElementById('input-new-first');
    let newPasswordSecondEle = document.getElementById('input-new-second');
    let inputOldPasswordEle = document.getElementById('input-old');
    let secretError = document.getElementById('oldPasswordError');
    let inputOldPassword = inputOldPasswordEle.value;
    if(inputOldPassword === '') {
        secretError.parentElement.className += ' is-invalid';
        secretError.textContent = "To remove encryption you need to type in your password";
    } else {
        try {
            let result = ipcRenderer.sendSync('resetPassword', {oldPassword: inputOldPassword});
            checkIPCMessage(result);
            useDefaultPassword = true;
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
        } catch (e) {
            secretError.parentElement.className += ' is-invalid';
            secretError.textContent = e.message;
        }
    }
}

/**
 * Use ntp to check the current time of the pc
 */
function checkTime() {

    ntpTimeCompare().then(function (message) {
        dialog = document.getElementById("dialog-time");
        dialog.showModal();
        let timeMessage = document.getElementById("text-time");
        timeMessage.innerHTML = message;
    });
}

/**
 * Compares NTP with system time and returns a diff message as Promise
 */
function ntpTimeCompare() {
    let options = {
        host: 'time.google.com',  // Defaults to pool.ntp.org
        port: 123,                      // Defaults to 123 (NTP)
        resolveReference: true,         // Default to false (not resolving)
        timeout: 100                   // Defaults to zero (no timeout)
    };

    return Sntp.time(options).then( function (time) {
        if(time.t > 100 ) {
            let sec = Math.round(Math.abs(time.t / 1000) * 10) / 10;
            return Promise.resolve("Your clock is " + sec + " seconds behind");
        }
        if(time.t < -100) {
            let sec = Math.round(Math.abs(time.t / 1000) * 10) / 10;
            return Promise.resolve("Your clock is " + sec + " seconds ahead");
        }
        return Promise.resolve("Your time is good enough");
    }).catch(function () {
        return Promise.resolve("Failed: Cannot connect to time server");
    });

}

/**
 * Open license.html
 */
function openLicenses() {
    win.loadURL(url.format({
        pathname: path.join(__dirname, '../license/license.html'),
        protocol: 'file:',
        slashes: true
    }));
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