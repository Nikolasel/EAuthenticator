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

let fs = require('fs');
let Crypto = require('./storageCrypto');
let SecureRandom = require('secure-random/lib/secure-random');
let ChaCha20 = require('js-chacha20/src/jschacha20');
let textEncoding = require('text-encoding');
let TextEncoder = textEncoding.TextEncoder;
let TextDecoder = textEncoding.TextDecoder;
let TOTP = require('./totp');

const defaultPassword = 'defaultPassword';


/**
 * Class for handling the stored data
 * @type {module.StorageEngine}
 */
module.exports = class StorageEngine {

    constructor(pathToFile) {
        this.pathToFile = pathToFile;
        this.keyPassword = '';
        this.keyPasswordNonce = '';
        this.keyAccount = '';
        this.keyAccountNonce = '';
        this.chaChaAccounts = '';
        this.chaChaPassword = '';
        this.cachedAesData = '';
        this.crypto = new Crypto();
        this.passwordNeed = false;
        this.useDefaultPassword = true;
        this.noSuchFile = false;
        this.locked = true;

        //generate new passwords
        this._renewKeys();


        //load aes cache
        try {
            this._loadAesCache();
        }
        catch (e) {
            this.noSuchFile = true;
        }

        if (!this.noSuchFile) {
            //try to decrypt with default password
            let promise = this.unlockFile(defaultPassword);
            promise.catch(() => {
                this.useDefaultPassword = false;
                this.passwordNeed = true;
            })
        } else {
            this._generateNewEmptyAccount();
        }
    }

    /**
     * Returns all accounts with current otp
     * @returns {Array|*} Entry: {name: nameOfAccount, pin: totpPin}
     */
    getAllAccounts() {
        //TODO return hashmap
        let accounts = this._decryptAccounts();
        let result = [];
        for (let i = 0; i < accounts.length; i++) {
            let totpPin = new TOTP(accounts[i].secret).getPinAsString();
            let entry = {name: accounts[i].name, pin: totpPin};
            result.push(entry)
        }
        return result;
    }


    /**
     * Renames a account
     * @param name old name
     * @param newName new name
     * @throws error, if account name already exists or account was not found
     */
    renameAccount(name, newName) {
        let accounts = this._decryptAccounts();
        let indexOld = StorageEngine._indexInAccount(newName, accounts);
        let index = StorageEngine._indexInAccount(name, accounts);
        if (indexOld === index) {
            return;
        }
        if (indexOld > -1) {
            throw new Error("Account name already exists");
        }
        if (index > -1) {
            accounts[index].name = newName;
        } else {
            throw new Error("Account not found");
        }
        this._encryptAccounts(accounts);
    }

    /**
     * Deletes the account
     * @param name of the account
     * @throws error, if it not possible to delete account
     */
    deleteAccount(name) {
        let accounts = this._decryptAccounts();
        let index = StorageEngine._indexInAccount(name, accounts);
        if (index > -1) {
            accounts.splice(index, 1);
        } else {
            throw new Error("Not possible to delete")
        }
        this._encryptAccounts(accounts);
    }

    /**
     * Adds a account to the account list
     * @param account
     * @throws error, if account already exists
     */
    addAccount(account) {
        let accounts = this._decryptAccounts();
        let index = StorageEngine._indexInAccount(account.name, accounts);
        if (index === -1) {
            accounts.push(account);
        } else throw new Error("Account already exists");
        this._encryptAccounts(accounts);
        this.noSuchFile = false;
    }

    /**
     * Changes the old password to new password
     * @param oldPassword
     * @param newPassword
     * @throws error, if old password is incorrect
     */
    changePassword(oldPassword, newPassword) {
        if (this._checkPassword(oldPassword)) {
            let enc = new TextEncoder("utf-8");
            this.chaChaPassword = new ChaCha20(this.keyPassword, this.keyPasswordNonce).encrypt(enc.encode(newPassword));
            this.useDefaultPassword = false;
        }
        else throw new Error("Incorrect old password");
    }

    /**
     * Resets the password
     * @param oldPassword
     * @throws error, if old password is incorrect
     */
    resetPassword(oldPassword) {
        this.changePassword(oldPassword, defaultPassword);
        this.useDefaultPassword = true;
    }

    /**
     * Locks the accounts
     * @throws error, if file cannot be saved
     * @async
     * @return {Promise}
     */
    lockFile() {
        //save changes
        if(!this.locked) {
            let promise = this._saveToFile();
            return promise.then(() => {
                //delete saved ChaCha20 data
                this.chaChaPassword = '';
                this.chaChaAccounts = '';
                //renew passwords
                this._renewKeys();
                //set no such file to false
                this.noSuchFile = false;
                //password need
                this.passwordNeed = true;
                //set locked
                this.locked = true;
            });
        } else {
            return Promise.resolve();
        }
    }

    /**
     * Unlocks the data file
     * @param password
     * @throws error, if password is false
     * @async
     * @return {Promise}
     */
    unlockFile(password) {
        if(this.locked) {
            let data = new Uint8Array(this.cachedAesData);
            let promise = this.crypto.decryptString(data, password);
            return promise.then((plaintext) => {
                let enc = new TextEncoder("utf-8");
                this.chaChaAccounts = new ChaCha20(this.keyAccount, this.keyAccountNonce).encrypt(enc.encode(plaintext.data));
                this.chaChaPassword = new ChaCha20(this.keyPassword, this.keyPasswordNonce).encrypt(enc.encode(password));
                this.cachedAesData = '';
                this.passwordNeed = false;
                this.locked = false;
            }, () => {
                throw new Error("Password false");
            });
        } else {
            return Promise.resolve();
        }
    }


    /**
     * Returns true if data is encrypted with default password
     * @returns {boolean}
     */
    useDefPass() {
        return this.useDefaultPassword;
    }

    /**
     * Returns true if user need to type in password
     * @returns {boolean}
     */
    needPassword() {
        return this.passwordNeed;
    }

    /**
     * Return false if a user data file was found
     * @returns {boolean}
     */
    noFileFound() {
        return this.noSuchFile;
    }

    /**
     * Checks the given password with the current password
     * @param givenPassword
     * @returns {boolean}
     * @private
     */
    _checkPassword(givenPassword) {
        let enc = new TextEncoder("utf-8");
        let encryptedPassword = new ChaCha20(this.keyPassword, this.keyPasswordNonce).encrypt(enc.encode(givenPassword));
        return StorageEngine._uInt8ArrayEqual(encryptedPassword, this.chaChaPassword)
    }

    /**
     * Saves current accounts to aes file
     * @private
     * @throws error, if file cannot be saved
     * @async
     * @return {Promise}
     */
    _saveToFile() {
        let dec = new TextDecoder;
        let decryptedAccounts = dec.decode(new ChaCha20(this.keyAccount, this.keyAccountNonce).decrypt(this.chaChaAccounts));
        let decryptedPasswords = dec.decode(new ChaCha20(this.keyPassword, this.keyPasswordNonce).decrypt(this.chaChaPassword));
        let cryptoPromise = this.crypto.encryptString(decryptedAccounts, decryptedPasswords);
        return cryptoPromise.then((ciphertext) => {
            let data = ciphertext.message.packets.write();
            let err = fs.writeFileSync(this.pathToFile, data);
            if (err) {
                throw new Error("Cannot save file");
            } else {
                //set aesCache
                this.cachedAesData = data;
            }
        });
    }

    /**
     * Generates new Secure Random for memory keys
     * @private
     */
    _renewKeys() {
        this.keyPassword = SecureRandom(32, {type: 'Uint8Array'});
        this.keyPasswordNonce = SecureRandom(12, {type: 'Uint8Array'});
        this.keyAccount = SecureRandom(32, {type: 'Uint8Array'});
        this.keyAccountNonce = SecureRandom(12, {type: 'Uint8Array'});
    }

    /**
     * Load aes file
     * @private
     * @throws error, if no such file
     */
    _loadAesCache() {
        this.cachedAesData = fs.readFileSync(this.pathToFile, null);
    }

    /**
     * Generates a new empty account
     * @private
     */
    _generateNewEmptyAccount() {
        let accounts = [];
        let stringOfAccounts = JSON.stringify(accounts);
        let enc = new TextEncoder("utf-8");
        this.chaChaAccounts = new ChaCha20(this.keyAccount, this.keyAccountNonce).encrypt(enc.encode(stringOfAccounts));
        this.chaChaPassword = new ChaCha20(this.keyPassword, this.keyPasswordNonce).encrypt(enc.encode(defaultPassword));
        this.locked = false;
    }

    /**
     * Decrypts the current accounts with ChaCha20
     * @returns {Object} like _parseData
     * @private
     */
    _decryptAccounts() {
        let dec = new TextDecoder;
        let decryptedAccounts = dec.decode(new ChaCha20(this.keyAccount, this.keyAccountNonce).decrypt(this.chaChaAccounts));
        return StorageEngine._parseData(decryptedAccounts);
    }

    /**
     * Encrypt the given accounts with ChaCha20
     * @param accounts Object
     * @private
     */
    _encryptAccounts(accounts) {
        let stringOfAccounts = JSON.stringify(accounts);
        let enc = new TextEncoder("utf-8");
        //Renew nonce, so the content is protected.
        this.keyAccountNonce = SecureRandom(12, {type: 'Uint8Array'});
        this.chaChaAccounts = new ChaCha20(this.keyAccount, this.keyAccountNonce).encrypt(enc.encode(stringOfAccounts));
    }

    /**
     * Parse the Json data
     * @param data
     */
    static _parseData(data) {
        // data must be json
        // [{'name' : "bla", 'secret': "AAAAA"}, {'name' : "bla2", 'secret': "BBBBB"}]
        try {
            // TODO: Check with schema
            return JSON.parse(data);
        }
        catch (e) {
            throw new Error("Invalid data");
        }
    }

    /**
     * Returns index of name in accounts. -1 if name is not in accounts
     * @param name
     * @param accounts for searching
     * @returns {number}
     */
    static _indexInAccount(name, accounts) {
        let index = -1;
        for (let i = 0; i < accounts.length; i++) {
            if (accounts[i].name === name) {
                index = i;
                break;
            }
        }
        return index;
    }

    /**
     * Check if 2 UInt8Arrays are equal
     * @param arr1 first array
     * @param arr2 second array
     * @returns {boolean}
     * @private
     */
    static _uInt8ArrayEqual(arr1, arr2) {
        if (arr1.length !== arr2.length) return false;
        for (let i = 0; i !== arr1.length; i++) {
            if (arr1[i] !== arr1[i]) return false;
        }
        return true;
    }


};
