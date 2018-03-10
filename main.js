const {app, BrowserWindow, clipboard} = require('electron');
const path = require('path');
const url = require('url');
let ipcMain = require('electron').ipcMain;
let Storage = require('./lib/storage');
let storage;

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let win;
let storageWindow;

function createWindow () {
    storageWindow = new BrowserWindow({ show: false });
    storageWindow.loadURL(url.format({
        pathname: path.join(__dirname, 'pages/storageProcess/storageProcess.html'),
        protocol: 'file:',
        slashes: true
    }));
    storageWindow.webContents.openDevTools();

    // Create the browser window.
    win = new BrowserWindow({width: 800, height: 600, minHeight: 300, minWidth: 450, icon: path.join(__dirname, 'img/icon64x64.png')});

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
        win = null
    })
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', function() {
    storage = new Storage(app, undefined, false);
    createWindow();
});

// Quit when all windows are closed.
app.on('window-all-closed', () => {
    // On macOS it is common for applications and their menu bar
    // to stay active until the user quits explicitly with Cmd + Q
    if (process.platform !== 'darwin') {
        app.quit()
    } else {
        storage = undefined;
    }
});

app.on('activate', () => {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (win === null) {
        storage = new Storage(app, undefined, false);
        createWindow()
    }
});


//ipcMain listener

ipcMain.on('get-storage', function(event) {
    event.returnValue = storage;
});

ipcMain.on('update-storage', function(event, arg) {
    storage = arg;
});

