let fs = require('fs');
let Crypto = require('./storageCrypto');
let SecureRandom = require('secure-random/lib/secure-random');
const defaultPassword = 'defaultPassword';
let ChaCha20 = require('js-chacha20/src/jschacha20');
let textEncoding = require('text-encoding');
let TextEncoder = textEncoding.TextEncoder;
let TextDecoder = textEncoding.TextDecoder;


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
        this.withDefaultPasswordEncrypted = true;
        this.noSuchFile = false;
        this.crypto = new Crypto();

        //generate new passwords
        this._renewKeys();


        //load aes cache
        try {
            this._loadAesCache();
        }
        catch (e) {
            this.noSuchFile = true;
        }

        if(!this.noSuchFile) {
            //try to decrypt with default password
            this.unlockFile(defaultPassword, true);
        } else {
            this._generateNewEmptyAccount();
        }
    }

    /**
     * Returns all accounts with current otp
     * @returns {Array|*}
     */
    getAllAccounts() {

    }


    /**
     * Renames a account
     * @param name old name
     * @param newName new name
     */
    renameAccount(name, newName) {

    }

    /**
     * Deletes the account
     * @param name of the account
     */
    deleteAccount(name) {

    }

    /**
     * Adds a account to the account list
     * @param account
     */
    addAccount(account) {

    }

    changePassword(oldPassword, newPassword) {
        if (this._checkPassword(oldPassword)) {
            let enc = new TextEncoder("utf-8");
            this.chaChaPassword = new ChaCha20(this.keyPassword, this.keyPasswordNonce).encrypt(enc.encode(newPassword));
        }
        else throw new Error("Incorrect old password");
    }

    resetPassword(oldPassword) {
        this.changePassword(oldPassword, defaultPassword);
    }

    lockFile() {
        //save changes
        this._saveToFile();
        //delete saved ChaCha20 data
        this.chaChaPassword = '';
        this.chaChaAccounts = '';
        //renew passwords
        this._renewKeys();
        //set no such file to false
        this.noSuchFile = false;
    }

    unlockFile(password, bDefault) {
        let data = new Uint8Array(this.cachedAesData);
        let promise = this.crypto.decryptString(data, password);
        promise.then((plaintext) => {
            let enc = new TextEncoder("utf-8");
            this.chaChaAccounts = new ChaCha20(this.keyAccount, this.keyAccountNonce).encrypt(enc.encode(plaintext.data));
            this.chaChaPassword = new ChaCha20(this.keyPassword, this.keyPasswordNonce).encrypt(enc.encode(password));
            this.cachedAesData = '';
        }, () => {
            if (bDefault) {
                this.withDefaultPasswordEncrypted = false;
            }
        })
    }


    needPassword() {
        return !this.withDefaultPasswordEncrypted;
    }

    noFileFound() {
        return this.noSuchFile;
    }

    _checkPassword(givenPassword) {
        let enc = new TextEncoder("utf-8");
        let encryptedPassword = new ChaCha20(this.keyPassword, this.keyPasswordNonce).encrypt(enc.encode(givenPassword));
        return StorageEngine._uInt8ArrayEqual(encryptedPassword, this.chaChaPassword)
    }

    _saveToFile() {
        let dec = new TextDecoder;
        let decryptedAccounts = dec.decode(new ChaCha20(this.keyAccount, this.keyAccountNonce).decrypt(this.chaChaAccounts));
        let decryptedPasswords = dec.decode(new ChaCha20(this.keyPassword, this.keyPasswordNonce).decrypt(this.chaChaPassword));
        let cryptoPromise = this.crypto.encryptString(decryptedAccounts, decryptedPasswords);
        cryptoPromise.then((ciphertext) => {
            let data = ciphertext.data;//.message.packets.write();
            let err = fs.writeFileSync(this.pathToFile, data);
            //set aesCache
            this.cachedAesData = data;
            return err;
        });
    }

    _renewKeys() {
        this.keyPassword = SecureRandom(32, {type: 'Uint8Array'});
        this.keyPasswordNonce = SecureRandom(12, {type: 'Uint8Array'});
        this.keyAccount = SecureRandom(32, {type: 'Uint8Array'});
        this.keyAccountNonce = SecureRandom(12, {type: 'Uint8Array'});
    }

    /**
     * Load aes file
     * @private
     * Throw error, if no such file
     */
    _loadAesCache() {
        this.cachedAesData = fs.readFileSync(this.pathToFile, null);
    }

    _generateNewEmptyAccount() {
        let accounts = [];
        let stringOfAccounts = JSON.stringify(accounts);
        let enc = new TextEncoder("utf-8");
        this.chaChaAccounts = new ChaCha20(this.keyAccount, this.keyAccountNonce).encrypt(enc.encode(stringOfAccounts));
        this.chaChaPassword = new ChaCha20(this.keyPassword, this.keyPasswordNonce).encrypt(enc.encode(defaultPassword));
    }

     static _uInt8ArrayEqual(arr1, arr2) {
        if (arr1.length !== arr2.length) return false;
        for (let i = 0 ; i !== arr1.length ; i++) {
            if (arr1[i] !== arr1[i]) return false;
        }
        return true;
    }


};
