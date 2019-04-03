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

let openpgp = require('openpgp'); // use as CommonJS, AMD, ES6 module or via window.openpgp

/**
 * Class that handles the crypto for storage
 * @type {module.StorageCrypto}
 */
module.exports = class StorageCrypto {

    constructor() {
        //openpgp.initWorker({ path:'openpgp.worker.js' });
    }

    /**
     * Encrypts a string
     * @param string
     * @param key
     * @returns {Promise}
     */
    encryptString(string, key) {
        let options = {
            data : string,
            // For openpgp 4
            //message: openpgp.message.fromText(string),
            passwords: [key],
            armor: false,
        };
        return openpgp.encrypt(options);
    }

    /**
     * Decrypts a string
     * @param string
     * @param key
     * @returns {Promise}
     */
    decryptString(string, key) {
        // Read async in openpgp 4
        let message = openpgp.message.read(string);
        let options = {
            message: message,
            passwords: [key],
            format: 'utf8',
        };
        return openpgp.decrypt(options);
    }

    /**
     * Checks if data is encrypted
     * @param data
     * @returns {boolean}
     */
    checkDataIsEncrypted(data) {
        try {
            openpgp.message.read(data);
            return true;
        }
        catch (e) {
            return e.message !== "Error during parsing. This message / key probably does not conform to a valid OpenPGP format.";
        }
    }
};