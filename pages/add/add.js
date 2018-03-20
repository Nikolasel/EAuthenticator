let ipcRenderer = require('electron').ipcRenderer;

/**
 * Changes the top down menu
 */
function changeToTimeBased() {
    document.getElementById("menu-lower-left").innerHTML = 'time based <i class="material-icons">keyboard_arrow_down</i>';
}

/**
 * Changes the top down menu
 */
function changeToCounterBased() {
    document.getElementById("menu-lower-left").innerHTML = 'counter based <i class="material-icons">keyboard_arrow_down</i>';

}

/**
 * Adds a account to storage
 */
function addAccount() {
    let errors = false;
    let account = document.getElementById('name');
    let accountValue = account.value;
    let secret = document.getElementById('secret');
    let secretValue = secret.value;
    //evaluate account
    try {
        if(accountValue === "") {
            throw new Error ("The name can't be empty");
        }
        /*if(storage.isNameDuplicate(accountValue)) {
            throw new Error ("Name already exists");
        }*/
    }
    catch (e) {
        let secretError = document.getElementById('accountError');
        secretError.parentElement.className += ' is-invalid';
        secretError.textContent = e.message;
        errors = true;
    }
    //evaluate secret
    try {
        //To short
        if(secretValue.length < 16) {
            throw new Error ("The secret is too short");
        }
        //False chars
        let chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
        secretValue = secretValue.toUpperCase();
        secretValue = secretValue.replace(" ", "");
        if(!allCharsInAlphabet(chars, secretValue)) {
            throw new Error ("The secret is wrong. It can only contain 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567'.");
        }
    }
    catch (e) {
        let secretError = document.getElementById('secretError');
        secretError.parentElement.className += ' is-invalid';
        secretError.textContent = e.message;
        errors = true;
    }
    if(!errors){
        try {
            let result = ipcRenderer.sendSync("addAccount", {account:{name: accountValue, secret:secretValue}});
            checkIPCMessage(result);
            history.go(-1);
        }
        catch (e) {
            let secretError = document.getElementById('accountError');
            secretError.parentElement.className += ' is-invalid';
            secretError.textContent = e.message;
        }
    }
}

/**
 * Checks if string contains only chars from alphabet
 * @param alphabet
 * @param string
 * @returns {boolean}
 */
function allCharsInAlphabet(alphabet, string) {
    for(let i = 0; i < string.length; i++) {
        if(!alphabet.includes(string[i])) {
            return false;
        }
    }
    return true;
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