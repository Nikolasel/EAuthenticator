let win = require('electron').remote.getCurrentWindow();
let Storage = require('../../lib/storage');
let storage = new Storage();
const path = require('path');
const url = require('url');
const remote = require('electron').remote;
let app = undefined;
if (remote !== undefined) app = remote.app;
let TOTP = require('../../lib/totp');
google.charts.load('current', {'packages': ['corechart']});

let sync = true;


function toAdd() {
    win.loadURL(url.format({
        pathname: path.join(__dirname, '../add/add.html'),
        protocol: 'file:',
        slashes: true
    }));
}


function showAccounts() {
    let list = document.getElementById("list-of-accounts");
    if (storage.isDataEncrypted()) {
        //Set Password
    }
    let accounts = storage.getAllAccounts();
    let pins = [];
    let times = [];
    if (accounts.length === 0) {
        //Help to add new Account
        alert("Empty: " + app.getPath("userData"));
    } else {
        for (let i = 0; i < accounts.length; i++) {
            let listItem = document.createElement('li');
            listItem.className += " mdl-list__item";

            let span = document.createElement('span');
            span.className += " mdl-list__item-primary-content mdl-color-text--blue-grey-400";
            let name = accounts[i].name;
            span.innerHTML = name;
            listItem.appendChild(span);

            let spanPin = document.createElement('span');
            spanPin.className += " list-pin";
            let spanTimer = document.createElement('span');
            spanTimer.className += " list-time";
            spanTimer.innerHTML = "...";
            listItem.appendChild(spanPin);
            listItem.appendChild(spanTimer);

            let spanEnd = document.createElement('span');
            spanEnd.className += " mdl-list__item-secondary-action";
            //TODO Add tooltips <div class="mdl-tooltip" data-mdl-for="tt1"> Follow </div>
            let btnRename = document.createElement('button');
            btnRename.className += " mdl-button mdl-js-button mdl-button--icon";
            btnRename.innerHTML = "<i class=\"material-icons mdl-color-text--blue-grey-400\">create</i>";
            btnRename.addEventListener("click", function() {
                renameAccount(name);
            }, false);
            let btnDelete = document.createElement('button');
            btnDelete.className += " mdl-button mdl-js-button mdl-button--icon";
            btnDelete.innerHTML = "<i class=\"material-icons mdl-color-text--blue-grey-400\">delete</i>";
            btnDelete.addEventListener("click", function() {
                deleteAccount(name);
            }, false);
            spanEnd.appendChild(btnRename);
            spanEnd.appendChild(btnDelete);

            //spanEnd.innerHTML = //'<button class="mdl-button mdl-js-button mdl-button--icon" onclick="renameAccount(accounts[i].name)"><i class="material-icons mdl-color-text--blue-grey-400">create</i></button>' + ' ' +
            //    '<button class="mdl-button mdl-js-button mdl-button--icon"><i class="material-icons mdl-color-text--blue-grey-400">delete</i></button>';
            listItem.appendChild(spanEnd);
            list.appendChild(listItem);
            list.appendChild(document.createElement('hr'));
            pins.push(spanPin);
            times.push(spanTimer);
        }
        updatePin(accounts, pins);
        updateAll(times, accounts, pins);
        window.setInterval(function () {
            updateAll(times, accounts, pins);
        }, 1000)
    }
}

function updateAll(times, accounts, pins) {
    let seconds = getSecUntil30();
    if (seconds === 30) {
        updatePin(accounts, pins);
    }
    for (let i = 0; i < times.length; i++) {
        makeChart(seconds, times[i]);
    }
}


function updatePin(accounts, accountsMid) {
    for (let i = 0; i < accounts.length; i++) {
        let totp = new TOTP(accounts[i].secret);
        accountsMid[i].innerHTML = totp.getPinAsString();
    }
}


function getSecUntil30() {
    let time = new Date();
    if (sync) {
        while (time.getMilliseconds() > 100) {
            time = new Date();
        }
        sync = false;
    }
    let seconds = time.getSeconds();
    if (seconds >= 30) {
        return (60 - seconds);
    } else {
        return (30 - seconds);
    }
}

function makeChart(time, object) {
    let filled = Math.round(time / 30 * 100);
    let unfilled = 100 - filled;
    let data = google.visualization.arrayToDataTable([
        ['Time', 'Percentage'],
        ['', unfilled],
        ['', filled]
    ]);
    let options = {
        legend: 'none',
        pieSliceText: 'none',
        tooltip: {trigger: 'none'},
        slices: {
            0: {color: 'transparent'},
            1: {color: '#2196f3'}
        }
    };
    let chart = new google.visualization.PieChart(object);
    chart.draw(data, options);
    //object.innerHTML = time;
}

function renameAccount(name) {
    /*let res = prompt("New Name?", "");
    if(res === "") {
        alert("Empty");
        return;
    }
    try {
        storage.renameAccount(name, res);
        remote.getCurrentWindow().reload();
    }
    catch (e) {
        alert(e.message);
    }*/
    let close = document.createElement('button');
    close.setAttribute('type', 'button');
    close.className += ' mdl-button color-green';
    close.innerHTML = "Close";
    close.addEventListener('click', function () {
        while (dialog.firstChild) {
            dialog.removeChild(dialog.firstChild);
        }
        dialog.close()
    }, false);
    let doSom = document.createElement('button');
    doSom.setAttribute('type', 'button');
    doSom.className += ' mdl-button color-green';
    doSom.innerHTML = "Disabled action";
    let text = document.createElement('div');
    text.className += ' mdl-textfield mdl-js-textfield';
    let input = document.createElement('input');
    input.className += ' mdl-textfield__input';
    input.setAttribute('type', 'text');
    input.setAttribute('id', 'inputRename');
    let label = document.createElement('label');
    label.className += ' mdl-textfield__label';
    label.setAttribute('for', 'inputRename');
    label.innerHTML = 'New Account Name';
    input.innerHTML = name;
    text.appendChild(input);
    text.appendChild(label);
    let array = [close, doSom];
    makeDialog("Test", text, array);
}


function deleteAccount(name) {
    let bool = confirm("Do you want to delete this?");
    if (bool) {
        try {
            storage.deleteAccount(name);
            remote.getCurrentWindow().reload();
        }
        catch (e) {
            alert(e.message);
        }
    }
}


function makeDialog(headerText, bodyObject, listOfButtons) {
    let dialog = document.getElementById("dialog");
    let header = document.createElement('h3');
    header.className += ' mdl-dialog__title';
    header.innerHTML = headerText;
    let body = document.createElement('div');
    body.className += ' mdl-dialog__content';
    body.appendChild(bodyObject);
    let actions = document.createElement('div');
    body.className += ' mdl-dialog__actions';

    for(let i = listOfButtons.length -1 ; i >= 0; i--) {
        actions.appendChild(listOfButtons[i]);
    }

    dialog.appendChild(header);
    dialog.appendChild(body);
    dialog.appendChild(actions);
    dialog.showModal();
}