/*
* An Electron Desktop app compatible with Google Authenticator.
* Copyright (C) 2018  Nikolas Eller

* This program is free software: you can redistribute it and/or modify
* it under the terms of the GNU General Public License as published by
* the Free Software Foundation, either version 3 of the License, or
* (at your option) any later version.

* This program is distributed in the hope that it will be useful,
* but WITHOUT ANY WARRANTY; without even the implied warranty of
* MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
* GNU General Public License for more details.

* You should have received a copy of the GNU General Public License
* along with this program. If not, see <http://www.gnu.org/licenses/>.
*/

"use strict";

let HTOP = require('./hotp.js');

/**
 * Implementation of 'TOTP: Time-Based One-Time Password Algorithm' based on RFC 6238
 * @type {module.TOTP}
 */
module.exports = class TOTP {

    constructor(secret) {
        this.htop = new HTOP(secret)
    }

    /**
     * Returns the pin as an string
     * @return {string}
     */
    getPinAsString() {
        let res = this.getPin();
        let str = res.toString(10);
        str = this.htop.addPadding(str, 6);
        return str.substring(0, 3) + " " + str.substring(3, 6);
    }

    /**
     * Returns the pin as an number
     * @return {Number}
     */
    getPin() {
        return this.getPinWithTime(Date.now());
    }

    /**
     * Return the pin to a specific time
     * @param time {Date}
     * @return {Number}
     */
    getPinWithTime(time) {
        let unixTime = Math.round(time / 1000);
        let x = 30;
        let normlizedTime = Math.floor(unixTime / x);
        let timeInHex = TOTP.dec2Hex(normlizedTime, 16);
        let finalTime = this.htop.addPadding(timeInHex, 16);
        return this.htop.getPin(finalTime);
    }


    /**
     * Converts an decimal string to an hex string
     * @param dec
     * @return {string}
     */
    static dec2Hex(dec) {
        return dec.toString(16);
    }
};