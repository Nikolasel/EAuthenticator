const remote = require('electron').remote;
let app = undefined;
if (remote !== undefined) app = remote.app;
let StorageEngine = require('../../lib/newStorage');
let storage;
let ipcMain = require('electron').ipcMain;

function init() {
    storage = new StorageEngine(app.getPath("userData") + '/eauth.data');
}


ipcMain.on('getAllAccounts', (event, arg) => {
    console.log(arg); // prints "ping"
    event.returnValue = 'pong'
});

ipcMain.on('renameAccount', (event, arg) => {
    console.log(arg); // prints "ping"
    event.returnValue = 'pong'
});

ipcMain.on('deleteAccount', (event, arg) => {
    console.log(arg); // prints "ping"
    event.returnValue = 'pong'
});

ipcMain.on('addAccount', (event, arg) => {
    console.log(arg); // prints "ping"
    event.returnValue = 'pong'
});

ipcMain.on('changePassword', (event, arg) => {
    console.log(arg); // prints "ping"
    event.returnValue = 'pong'
});

ipcMain.on('resetPassword', (event, arg) => {
    console.log(arg); // prints "ping"
    event.returnValue = 'pong'
});

ipcMain.on('lockFile', (event, arg) => {
    console.log(arg); // prints "ping"
    event.returnValue = 'pong'
});

ipcMain.on('unlockFile', (event, arg) => {
    console.log(arg); // prints "ping"
    event.returnValue = 'pong'
});

ipcMain.on('needPassword', (event, arg) => {
    event.returnValue = storage.needPassword();
});

ipcMain.on('noFileFound', (event, arg) => {
    event.returnValue = storage.noFileFound();
});