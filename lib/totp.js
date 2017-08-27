// TOTP: Time-Based One-Time Password Algorithm based on RFC 6238

"use strict";

let HTOP = require('./hotp.js');

module.exports = class TOTP {

    constructor(secret) {
        this.htop = new HTOP(secret)
    }

    getPin() {
        let unixTime = Math.floor(Date.now() / 1000);
        let x = 30;
        let normlizedTime = Math.floor(unixTime / x);
        let timeInHex = TOTP.dec2Hex(normlizedTime, 16);
        let finalTime = this.htop.addPadding(timeInHex);
        return this.htop.getPin(finalTime);
    }

    static dec2Hex(dec) {
        return dec.toString(16);
    }
};