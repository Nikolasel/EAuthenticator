let fs = require('fs');
let Crypto = require('./storageCrypto');
let app = undefined;

/**
 * Class for handling the stored data
 * @type {module.StorageEngine}
 */
module.exports = class StorageEngine {

    /**
     * Constructor
     * @param appGet app from electron
     * @param oldStorageData if data was fetched before
     * @param withCached bool, if true data was fetched before
     */
    constructor(appGet, oldStorageData, withCached) {
        // Set Standard value
        app = appGet;
        this.crypto = new Crypto();
        if (!withCached) {
            this.existsFile = true;
            this.dataEncrypted = false;
            this.accounts = [];
            //Key saved as clear text :(
            this.key = "";
            this.enryptedData = "";

            let path = "";
            if (app === undefined) {
                path = "Files"
            }
            else path = app.getPath("userData");
            try {
                let data = fs.readFileSync(path + '/eauth.data' , null);
                this.dataEncrypted = this.crypto.checkDataIsEncrypted(data);
                if (!this.dataEncrypted) {
                    this.parseData(data);
                } else {
                    this.enryptedData = data;
                }
            }
            catch (e) {
                this.existsFile = false;
            }
        } else {
            this.existsFile = oldStorageData.existsFile;
            this.dataEncrypted = oldStorageData.dataEncrypted;
            this.accounts = oldStorageData.accounts;
            this.key = oldStorageData.key;
            this.enryptedData = oldStorageData.enryptedData;
        }
    }


    /**
     * Returns all accounts
     * @returns {Array|*}
     */
    getAllAccounts() {
        return this.accounts;
    }

    /**
     * Returns one account
     * @param name of the account
     * @returns {*}
     */
    getAccount(name) {
        let index = this.indexInAccount(name);
        if (index > -1) {
            return this.accounts[index];
        } else {
            throw new Error("No Account with this name");
        }
    }

    /**
     * Renames a account
     * @param name old name
     * @param newName new name
     */
    renameAccount(name, newName) {
        let indexOld = this.indexInAccount(newName);
        let index = this.indexInAccount(name);
        if(indexOld === index) {
            return;
        }
        if(indexOld > -1) {
            throw new Error("Account exists");
        }
        if (index > -1) {
            this.accounts[index].name = newName;
            this.storeAccToFile();
        } else {
            throw new Error("Account not found");
        }
    }

    /**
     * Deletes the account
     * @param name of the account
     */
    deleteAccount(name) {
        let index = this.indexInAccount(name);
        if (index > -1) {
            this.accounts.splice(index, 1);
            this.storeAccToFile();
        } else {
            throw new Error("Not possible to delete")
        }

    }

    /**
     * Adds a account to the account list
     * @param account
     */
    addAccount(account) {
        let index = this.indexInAccount(account.name);
        if (index === -1) {
            this.existsFile = true;
            this.accounts.push(account);
            this.storeAccToFile();
        } else throw new Error("Account exists");
    }

    /**
     * Stores data to file
     */
    storeAccToFile() {
        let data = JSON.stringify(this.accounts);
        if (this.dataEncrypted) {
            let promise = this.crypto.encryptString(data, this.key);
            promise.then(function (ciphertext) {
                data = ciphertext.message.packets.write();
                StorageEngine.helpToStore(data);
            }, function () {
                alert("Error");
                throw new Error("CryptoError");
            });
        } else {
            StorageEngine.helpToStore(data);
        }
    }

    /**
     * Helper function for storeAccToFile
     * @param data
     */
    static helpToStore(data) {
        let path = "";
        if (app === undefined) {
            path = "Files"
        }
        else path = app.getPath("userData");
        let err = fs.writeFileSync(path + '/eauth.data', data);
        return err;
    }


    /**
     * Changes the encryption key
     * @param key
     */
    setNewKey(key) {
        this.key = key;
        this.dataEncrypted = true;
        this.storeAccToFile();
    }

    /**
     * Removes the encryption
     */
    removeEncryption() {
        this.key = "";
        this.dataEncrypted = false;
        this.storeAccToFile();
    }

    /**
     * On startup if data is encrypted this decrypts the data
     * @param key
     * @returns {*}
     */
    setKey(key) {
        this.key = key;
        let data = new Uint8Array(this.enryptedData.data);
        return this.crypto.decryptString(data, key);
    }

    /**
     * Parse the Json data
     * @param data
     */
    // data musst be json
    // [{'name' : "bla", 'secret': "AAAAA"}, {'name' : "bla2", 'secret': "BBBBB"}]
    parseData(data) {
        try {
            // TODO: Check with schema
            this.accounts = JSON.parse(data);
        }
        catch (e) {
            throw new Error("Invalid data");
        }
    }

    /**
     * Checks if data is encrypted
     * @returns {boolean|*}
     */
    isDataEncrypted() {
        return this.dataEncrypted;
    }

    /**
     * Checks if a data file is in directory
     * @returns {boolean|*}
     */
    existsFileInPath() {
        return this.existsFile;
    }

    /**
     * Checks if name is already in storage
     * @param name
     * @returns {boolean}
     */
    isNameDuplicate(name) {
        return !(this.indexInAccount(name) === -1);
    }

    /**
     * Return the key
     * @returns {string|*}
     */
    getKey() {
        return this.key;
    }

    /**
     * Returns index of name in accounts. -1 if name is not in accounts
     * @param name
     * @returns {number}
     */
    indexInAccount(name) {
        let index = -1;
        for (let i = 0; i < this.accounts.length; i++) {
            if (this.accounts[i].name === name) {
                index = i;
                break;
            }
        }
        return index;
    }

    /**
     * Returns Object only with data
     * @returns {{existsFile: (boolean|*), dataEncrypted: (boolean|*), accounts: (Array|*), key: (string|*), enryptedData: (string|*)}}
     */
    serialize() {
        return {
            existsFile : this.existsFile,
            dataEncrypted : this.dataEncrypted,
            accounts : this.accounts,
            key : this.key,
            enryptedData : this.enryptedData,
        }
    }

    /**
     * Makes encrypted data to ArrayBuffer
     * @param buf
     * @returns {ArrayBuffer}
     */
    static toArrayBuffer(buf) {
        let ab = new ArrayBuffer(buf.length);
        let view = new Uint8Array(ab);
        for (let i = 0; i < buf.length; ++i) {
            view[i] = buf[i];
        }
        return ab;
    }
};
