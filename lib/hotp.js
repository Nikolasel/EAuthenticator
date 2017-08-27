// HOTP: An HMAC-Based One-Time Password Algorithm based on RFC4226


// HOTP(K,C) = Truncate(HMAC-SHA-1(K,C))


"use strict";

let jsSHA = require("jssha");


module.exports = class HOTP {

    constructor(secret) {
        this.secret = this.base32toHex(secret);
    }

    // counter and secret bytes
    getPin(counter) {
        let hmacObj = new jsSHA("SHA-1", "HEX");
        hmacObj.setHMACKey(this.secret, "HEX");
        let hexCounter = this.addPadding(counter.toString(16), 16);
        hmacObj.update(hexCounter);
        let hmac = hmacObj.getHMAC("HEX");
        let pin = this.truncateToPin(hmac);
        return pin;
    }

    // 20 bytes
    truncateToPin(bytesAsHexString) {
        let dt = this.dynamicTruncation(bytesAsHexString);
        return this.getHotpValue(dt);
    }


    strToNum(hexString) {
        let int = parseInt(hexString, 16);
        return int;
    }

    // bytesAsHexString with 40 char
    dynamicTruncation(bytesAsHexString) {
        // lower 4 bit of 20 bytes = 38
        let offset = bytesAsHexString.charAt(39);
        let offsetAsNumber = this.strToNum(offset);
        // p = bytesAsHexString[2*offsetAsNumber] ... bytesAsHexString[2 * offsetAsNumber + 8]
        let p = "";
        for(let i = 0; i < 8; i++) {
            p = p + bytesAsHexString.charAt(2*offsetAsNumber+i);
        }
        return this.cutFirstBit(p);
    }

    // bytesAsHexString with 8 char
    cutFirstBit(bytesAsHexString) {
        let firstNibble = bytesAsHexString.charAt(0);
        let intNibble = this.strToNum(firstNibble);
        if(intNibble < 8) {
            return bytesAsHexString;
        } else {
            intNibble = intNibble - 8;
        }
        return intNibble + bytesAsHexString.substring(1);
    }

    getHotpValue(dtAsHexString) {
        let digit = 6;
        let number = this.strToNum(dtAsHexString);
        return number % (Math.pow(10, digit));
    }

    base32toHex(base32) {

        let base32chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
        let bits = "";
        let hex = "";

        for (let i = 0; i < base32.length; i++) {
            let val = base32chars.indexOf(base32.charAt(i).toUpperCase());
            bits += this.addPadding(val.toString(2), 5);
        }

        for (let i = 0; i + 4 <= bits.length; i += 4) {
            let chunk = bits.substr(i, 4);
            hex = hex + parseInt(chunk, 2).toString(16);
        }
        return hex;
    }


    addPadding(str, length) {
        if (str.length < length) {
            let toAdd = length - str.length;
            for (let i = 0; i < toAdd; i++) {
                str = '0' + str;
            }
        }
        return str;
    }

};