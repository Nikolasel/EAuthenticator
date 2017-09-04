let win = require('electron').remote.getCurrentWindow();
const path = require('path');
const url = require('url');

function toAdd() {
    win.loadURL(url.format({
        pathname: path.join(__dirname, '../add/add.html'),
        protocol: 'file:',
        slashes: true
    }));
}