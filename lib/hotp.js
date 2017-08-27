"use strict";

let jsSHA = require("jssha");


/**
 * Implementation of 'HOTP: An HMAC-Based One-Time Password Algorithm' based on RFC4226
 * @type {module.HOTP}
 */
module.exports = class HOTP {

    constructor(secret) {
        this.secret = this.b32ToHex(secret);
    }


    /**
     * Returns the pin to the given counter
     * @param counter {number}
     * @return {Number} pin
     */
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
    /**
     * Truncates the pin
     * @param bytesAsHexString, size is 20 bytes (40 chars)
     * @return {Number} pin
     */
    truncateToPin(bytesAsHexString) {
        let dt = this.dynamicTruncation(bytesAsHexString);
        return this.getHotpValue(dt);
    }


    /**
     * Return the num of an hex string
     * @param hexString
     * @return {Number}
     */
    strToNum(hexString) {
        let int = parseInt(hexString, 16);
        return int;
    }

    /**
     * Calculates the DT
     * @param bytesAsHexString (40 chars)
     * @return {*}
     */
    dynamicTruncation(bytesAsHexString) {
        // lower 4 bit of 20 bytes = 38
        let offset = bytesAsHexString.charAt(39);
        let offsetAsNumber = this.strToNum(offset);
        // p = bytesAsHexString[2*offsetAsNumber] ... bytesAsHexString[2 * offsetAsNumber + 8]
        let p = "";
        for (let i = 0; i < 8; i++) {
            p = p + bytesAsHexString.charAt(2 * offsetAsNumber + i);
        }
        return this.cutFirstBit(p);
    }

    /**
     * Makes the most significant bit 0
     * @param bytesAsHexString
     * @return {*}
     */
    cutFirstBit(bytesAsHexString) {
        let firstNibble = bytesAsHexString.charAt(0);
        let intNibble = this.strToNum(firstNibble);
        if (intNibble < 8) {
            return bytesAsHexString;
        } else {
            intNibble = intNibble - 8;
        }
        return intNibble + bytesAsHexString.substring(1);
    }

    /**
     * Calculates the wanted pin
     * @param dtAsHexString
     * @return {number}
     */
    getHotpValue(dtAsHexString) {
        let digit = 6;
        let number = this.strToNum(dtAsHexString);
        return number % (Math.pow(10, digit));
    }


    /**
     * Converts an base32 string to an hex string
     * @param b32String
     * @return {string}
     */
    b32ToHex(b32String) {
        b32String = b32String.toUpperCase();
        b32String = b32String.replace(",", "").replace(" ", "");

        let chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";

        let result = "";
        let bytes = "";

        for (let i = 0; i < b32String.length; i++) {
            let b32ValInDec = chars.indexOf(b32String[i]);
            let b32ValInBin = b32ValInDec.toString(2);
            let b32ValInBinPadded = this.addPadding(b32ValInBin, 5);
            bytes = bytes + b32ValInBinPadded;
            if (bytes.length >= 8) {
                let oneByte = bytes.substring(0, 8);
                let numByte = parseInt(oneByte, 2);
                let padded = this.addPadding(numByte.toString(16), 2);
                result = result + padded;
                bytes = bytes.substring(8);
            }

        }
        return result;
    }


    /**
     * Adds '0' padding to str
     * @param str
     * @param length of complete string at the end
     * @return {string}
     */
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