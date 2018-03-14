//Windows Squirrel
//handle setup events as quickly as possible
const setupEvents = require('./installers/windows/setupEvents');
if (setupEvents.handleSquirrelEvent()) {
    // squirrel event handled and app will exit in 1000ms, so don't do anything else
    return;
}

const {app, BrowserWindow} = require('electron');
const path = require('path');
const url = require('url');
const {ipcMain} = require('electron');
const {dialog} = require('electron');

//Storage
let StorageEngine = require('./lib/storage');
let storage;

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let win;

function createWindow() {
    // Create the browser window.
    win = new BrowserWindow({
        width: 800,
        height: 600,
        minHeight: 300,
        minWidth: 450,
        icon: path.join(__dirname, 'img/icon64x64.png')
    });

    // Remove menu
    win.setMenu(null);

    // and load the index.html of the app.
    win.loadURL(url.format({
        pathname: path.join(__dirname, 'pages/index/index.html'),
        protocol: 'file:',
        slashes: true
    }));

    // Open the DevTools.
    //win.webContents.openDevTools();


    // Emitted when the window is closed.
    win.on('closed', () => {
        // Dereference the window object, usually you would store windows
        // in an array if your app supports multi windows, this is the time
        // when you should delete the corresponding element.
        win = null;
        let promise = storage.lockFile();
        promise.catch((e) => {
            catchError(e);
        });

    });

}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', function () {
    storageInit();
    createWindow();
});

// Quit when all windows are closed.
app.on('window-all-closed', () => {
    // On macOS it is common for applications and their menu bar
    // to stay active until the user quits explicitly with Cmd + Q
    if (process.platform !== 'darwin') {
        app.quit();
    }
});


app.on('activate', () => {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (win === null) {
        storageInit();
        createWindow()
    }
});

/**
 * Show dialog if an error was thrown
 * @param error
 */
function catchError(error) {
    dialog.showErrorBox('EAuthenticator Error', error.message);
}


/********************************************************
 * Storage functions
 *******************************************************/

/**
 * Init the storage
 */
function storageInit() {
    try {
        storage = new StorageEngine(app.getPath("userData") + '/eauth.data');
    }
    catch (e) {
        catchError(e);
    }
}

// ipc message = {status: Number, error: String}
// status like HTTP status codes https://en.wikipedia.org/wiki/List_of_HTTP_status_codes

ipcMain.on('getAllAccounts', (event) => {
    event.returnValue = storage.getAllAccounts();
});

/**
 * arg has the attribute name and newName
 */
ipcMain.on('renameAccount', (event, arg) => {
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
ipcMain.on('deleteAccount', (event, arg) => {
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
ipcMain.on('addAccount', (event, arg) => {
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
ipcMain.on('changePassword', (event, arg) => {
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
ipcMain.on('resetPassword', (event, arg) => {
    try {
        storage.resetPassword(arg.oldPassword);
        event.returnValue = {status: 200, error: ""};
    }
    catch (e) {
        event.returnValue = {status: 400, error: e.message};
    }
});

ipcMain.on('lockFile', (event) => {
    let promise = storage.lockFile();
    promise.then(() => {
        event.returnValue = {status: 200, error: ""};
    }, (e) => {
        event.returnValue = {status: 400, error: e.message};
    });
});

/**
 * arg has attribute password
 */
ipcMain.on('unlockFile', (event, arg) => {
    let promise = storage.unlockFile(arg.password);
    promise.then(() => {
        event.returnValue = {status: 200, error: ""};
    }, (e) => {
        event.returnValue = {status: 400, error: e.message};
    });
});

ipcMain.on('needPassword', (event) => {
    try {
        event.returnValue = storage.needPassword();
    }
    catch (e) {
        catchError(e);
    }
});

ipcMain.on('noFileFound', (event) => {
    try {
        event.returnValue = storage.noFileFound();
    } catch (e) {
        catchError(e);
    }
});

ipcMain.on('useDefaultPassword', (event) => {
    try {
        event.returnValue = storage.useDefPass();
    } catch (e) {
        catchError(e);
    }
});
