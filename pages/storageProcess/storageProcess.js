const remote = require('electron').remote;
let app = undefined;
if (remote !== undefined) app = remote.app;
let StorageEngine = require('../../lib/newStorage');
let storage;
const {ipcRenderer} = require('electron');

function init() {
    storage = new StorageEngine(app.getPath("userData") + '/eauth.data');
}

// ipc message = {status: Number, error: String}
// status like HTTP status codes https://en.wikipedia.org/wiki/List_of_HTTP_status_codes

ipcRenderer.on('getAllAccounts', (event) => {
    event.returnValue = storage.getAllAccounts();
});

/**
 * arg has the attribute name and newName
 */
ipcRenderer.on('renameAccount', (event, arg) => {
    try {
        storage.renameAccount(arg.name, arg.newName);
        event.returnValue = {status: 200, error: ""};
    }
    catch (e) {
        event.returnValue = {status: 400, error: e.message};
    }
    event.returnValue = 'pong'
});

/**
 * arg has the attribute name
 */
ipcRenderer.on('deleteAccount', (event, arg) => {
    try {
        storage.deleteAccount(arg.name);
        event.returnValue = {status: 200, error: ""};
    }
    catch (e) {
        event.returnValue = {status: 400, error: e.message};
    }
});

/**
 * arg has attribute account ({name: nameOfAccount, secret: preShared
 */
ipcRenderer.on('addAccount', (event, arg) => {
    try {
        storage.addAccount(arg.account);
        event.returnValue = {status: 200, error: ""};
    }
    catch (e) {
        event.returnValue = {status: 400, error: e.message};
    }
});

/**
 * arg has attribute oldPassword and newPassword
 */
ipcRenderer.on('changePassword', (event, arg) => {
    try {
        storage.changePassword(arg.oldPassword, arg.newPassword);
        event.returnValue = {status: 200, error: ""};
    }
    catch (e) {
        event.returnValue = {status: 400, error: e.message};
    }
});

/**
 * arg has attribute oldPassword
 */
ipcRenderer.on('resetPassword', (event, arg) => {
    try {
        storage.resetPassword(arg.oldPassword);
        event.returnValue = {status: 200, error: ""};
    }
    catch (e) {
        event.returnValue = {status: 400, error: e.message};
    }
});

ipcRenderer.on('lockFile', (event) => {
    try {
        storage.lockFile();
        event.returnValue = {status: 200, error: ""};
    }
    catch (e) {
        event.returnValue = {status: 500, error: e.message};
    }
});

/**
 * arg has attribute password
 */
ipcRenderer.on('unlockFile', (event, arg) => {
    try {
        storage.unlockFile(arg.password, false);
        event.returnValue = {status: 200, error: ""};
    }
    catch (e) {
        event.returnValue = {status: 400, error: e.message};
    }
});

ipcRenderer.on('needPassword', (event) => {
    let res = storage.needPassword();
    console.log(res);
    event.returnValue = res;
});

ipcRenderer.on('noFileFound', (event) => {
    let res = storage.noFileFound();
    console.log(res);
    event.returnValue = res;
});