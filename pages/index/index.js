let win = require('electron').remote.getCurrentWindow();
let Storage = require('../../lib/storage');
const path = require('path');
const url = require('url');
const remote = require('electron').remote;
let app = undefined;
if (remote !== undefined) app = remote.app;
let TOTP = require('../../lib/totp');
google.charts.load('current', {'packages':['corechart']});

let accTime = 0;

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
            span.className += " mdl-list__item-primary-content";
            let name = accounts[i].name;
            span.innerHTML = name;
            listItem.appendChild(span);

            let spanPin = document.createElement('span');
            spanPin.className += " list-pin";
            let spanTimer = document.createElement('span');
            spanTimer.className += " list-time";
            spanTimer.innerHTML = "test";
            listItem.appendChild(spanPin);
            listItem.appendChild(spanTimer);

            let spanEnd = document.createElement('span');
            spanEnd.className += " mdl-list__item-secondary-action";
            //TODO Add tooltips <div class="mdl-tooltip" data-mdl-for="tt1"> Follow </div>
            spanEnd.innerHTML =  '<button class="mdl-button mdl-js-button mdl-button--icon"><i class="material-icons">create</i></button>' + ' <button class="mdl-button mdl-js-button mdl-button--icon"><i class="material-icons">delete</i></button>';
            listItem.appendChild(spanEnd);
            //listItem.html = '<span class="mdl-list__item-primary-content">' + accounts[i].name + '</span>';
            list.appendChild(listItem);
            list.appendChild(document.createElement('hr'));
            pins.push(spanPin);
            times.push(spanTimer);
        }
        updatePin(accounts, pins);
        setTimer(times, (getMSUntil30() / 1000));
        window.setInterval(function () {
            updateAll(times, accounts, pins);
        }, 1000)
    }
}

function updateAll(times, accounts, pins) {
    let newTime = 0;
    if(times.length > 0) {
        //let acTime = parseInt(times[0].innerHTML);
        if(accTime > 1) {
            newTime = accTime - 1;
        } else {
            newTime = 30;
            updatePin(accounts, pins)
        }
    }
    for(let i = 0; i < times.length; i++) {
        //getChart(newTime);
        //times[i].innerHTML = newTime;
        accTime = newTime;
        makeChart(newTime, times[i]);
    }
}

function setTimer(times, time) {
    for(let i = 0; i < times.length; i++) {
        //times[i].innerHTML = time;
        accTime = time;
        makeChart(time, times[i]);
    }
}


function updatePin(accounts, accountsMid) {
    for (let i = 0; i < accounts.length; i++) {
        let totp = new TOTP(accounts[i].secret);
        accountsMid[i].innerHTML = totp.getPinAsString();
    }
}


function getMSUntil30() {
    let time = new Date();
    let seconds = time.getSeconds();
    if(seconds >= 30) {
        return (60 - seconds) * 1000;
    } else {
        return (30 - seconds) * 1000;
    }
}

function makeChart(newTime, object) {
    let filled = Math.round(newTime / 30 * 100);
    let unfilled = 100 - filled;
    let data = google.visualization.arrayToDataTable([
        ['Pac Man', 'Percentage'],
        ['', unfilled],
        ['', filled]
    ]);
    let options = {
        legend: 'none',
        pieSliceText: 'none',
        tooltip: { trigger: 'none' },
        slices: {
            0: {color: 'transparent'},
            1: {color: '#2196f3'}
        }
    };
    let chart = new google.visualization.PieChart(object);
    chart.draw(data, options);
}