let win = require('electron').remote.getCurrentWindow();
let Storage = require('../../lib/storage');
const path = require('path');
const url = require('url');
const remote = require('electron').remote;
let app = undefined;
if (remote !== undefined) app = remote.app;

function toAdd() {
    win.loadURL(url.format({
        pathname: path.join(__dirname, '../add/add.html'),
        protocol: 'file:',
        slashes: true
    }));
}


function showAccounts() {
    let list = document.getElementById("list-of-accounts");
    let storage = new Storage();
    if (storage.isDataEncrypted()) {
        //Set Password
    }
    let accounts = storage.getAllAccounts();
    if (accounts.length === 0) {
        //Help to add new Account
        alert("Empty: " + app.getPath("userData"));
    } else {
        for (let i = 0; i < accounts.length; i++) {
            let listItem = document.createElement('li');
            listItem.className += " mdl-list__item";

            let span = document.createElement('span');
            span.className += " mdl-list__item-primary-content";
            let name = accounts[i].name;
            span.innerHTML = name;
            listItem.appendChild(span);

            let spanMid = document.createElement('span');
            spanMid.className += " mdl-list__item-mid-content";
            spanMid.innerHTML = accounts[i].secret;
            listItem.appendChild(spanMid);

            let spanEnd = document.createElement('span');
            spanEnd.className += " mdl-list__item-secondary-action";
            //TODO Add tooltips <div class="mdl-tooltip" data-mdl-for="tt1"> Follow </div>
            spanEnd.innerHTML =  '<button class="mdl-button mdl-js-button mdl-button--icon"><i class="material-icons">create</i></button>' + ' <button class="mdl-button mdl-js-button mdl-button--icon"><i class="material-icons">delete</i></button>';
            listItem.appendChild(spanEnd);
            //listItem.html = '<span class="mdl-list__item-primary-content">' + accounts[i].name + '</span>';
            list.appendChild(listItem);
            list.appendChild(document.createElement('hr'));

        }
    }
}