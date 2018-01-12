const {app, BrowserWindow, clipboard} = require('electron');
const path = require('path');
const url = require('url');
let ipcMain = require('electron').ipcMain;
let Storage = require('./lib/storage');
let storage;
let idleTime = 0;

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let win;

function createWindow () {
    //set idleTime
    idleTime = 0;

    // Create the browser window.
    win = new BrowserWindow({width: 800, height: 600, minHeight: 300, minWidth: 300, icon: path.join(__dirname, 'img/icon64x64.png')});

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

    //keypress or mousemove event
    win.on('bla', () => {
        idleTime = 0;
    });

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
    //Increment the idle time counter every minute.
    setInterval(timerIncrement, 60000); // 1 minute
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

//app idle checking

function timerIncrement() {
    idleTime = idleTime + 1;
    if (idleTime === 2) {
        clearClipboard();
    }
    if (idleTime === 5) {
        logout();
    }
}



//TODO: Log out after 5 min
function logout() {
    storage = undefined;
    win = null;
    storage = new Storage(app, undefined, false);
    createWindow();
    clipboard.clear();
    new Notification({title: "EAuthenticator", body: "Logged out"});
}

//TODO: Clear clipboard after 2 min
function clearClipboard() {
    clipboard.clear();
    new Notification({title: "EAuthenticator", body: "Clipboard cleared"});
}


//ipcMain listener

ipcMain.on('get-storage', function(event) {
    event.returnValue = storage;
});

ipcMain.on('update-storage', function(event, arg) {
    storage = arg;
});

