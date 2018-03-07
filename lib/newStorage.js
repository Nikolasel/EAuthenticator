let fs = require('fs');
let Crypto = require('./storageCrypto');
let SecureRandom = require('secure-random/lib/secure-random');
const defaultPassword = 'defaultPassword';
let ChaCha20 = require('js-chacha20/src/jschacha20');


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
        this._loadAesCache();

        //try to decrypt with default password
        this.unlockFile(defaultPassword);
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
        if(this._checkPassword(oldPassword)) {
            let encryptedPass = new ChaCha20(this.keyPassword, this.keyPasswordNonce).encrypt(newPassword);
            this.chaChaPassword = encryptedPass;
        }
        //throw error
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
        //load aesCache
    }

    unlockFile(password)  {
        if (!this.noSuchFile) {
            let data = new Uint8Array(this.cachedAesData);
            let cryptoPromise = this.crypto.decryptString(data, password);
            cryptoPromise.then(function (plaintext) {
                this.chaChaAccounts = new ChaCha20(this.keyAccount, this.keyAccountNonce).encrypt(plaintext);
                this.chaChaPassword = new ChaCha20(this.keyPassword, this.keyPasswordNonce).encrypt(defaultPassword);
                this.cachedAesData = '';
            }, function () {
                this.withDefaultPasswordEncrypted = false;
            })
        }
    }

    needPassword() {
        return !this.withDefaultPasswordEncrypted;
    }

    noFileFound() {
        return this.noSuchFile;
    }

    _checkPassword(oldPassword) {
        let encryptedPassword = new ChaCha20(this.keyPassword, this.keyPasswordNonce).encrypt(oldPassword);
        return encryptedPassword === this.chaChaPassword;
    }

    _saveToFile() {
        let decryptedAccounts = new ChaCha20(this.keyAccount, this.keyAccountNonce).decrypt(this.chaChaAccounts);
        let decryptedPasswords = new ChaCha20(this.keyPassword, this.keyPasswordNonce).decrypt(this.chaChaPassword);
        let cryptoPromise = this.crypto.encryptString(decryptedAccounts, decryptedPasswords);
        let data = '';
        cryptoPromise.then(function (ciphertext) {
            data = ciphertext.message.packets.write();
            let err = fs.writeFileSync(this.pathToFile, data);
            return err;
        });
    }

    _renewKeys() {
        this.keyPassword = SecureRandom(32, {type: 'Uint8Array'});
        this.keyPasswordNonce = SecureRandom(12, {type: 'Uint8Array'});
        this.keyAccount = SecureRandom(32, {type: 'Uint8Array'});
        this.keyAccountNonce = SecureRandom(12, {type: 'Uint8Array'});
    }

    _loadAesCache() {
        //load encrypted file
        try {
            this.cachedAesData = fs.readFileSync(this.pathToFile, null);
        }
        catch (e) {
            throw Error();
        }
    }


};