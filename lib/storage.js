let fs = require('fs');
//const remote = require('electron').remote;
let Crypto = require('./storageCrypto');
let app = undefined;
//if (remote !== undefined) app = remote.app;
let textEncoding = require('text-encoding');
let TextDecoder = textEncoding.TextDecoder;


module.exports = class StorageEngine {

    constructor(appGet, oldStorageData, withCached) {
        // Set Standard value
        app = appGet;
        this.crypto = new Crypto();
        if (!withCached) {
            this.existsFile = true;
            this.dataEncrypted = false;
            this.accounts = [];
            //Key saved as cleartext :(
            this.key = "";
            this.enryptedData = "";

            let path = "";
            if (app === undefined) {
                path = "Files"
            }
            else path = app.getPath("userData");
            try {
                let data = fs.readFileSync(path + '/eauth.data');
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


    getAllAccounts() {
        return this.accounts;
    }

    getAccount(name) {
        let index = this.indexInAccount(name);
        if (index > -1) {
            return this.accounts[index];
        } else {
            throw new Error("No Account with this name");
        }
    }

    renameAccount(name, newName) {
        //TODO No name duplicate
        let index = this.indexInAccount(name);
        if (index > -1) {
            this.accounts[index].name = newName;
        } else {
            throw new Error("Account not found");
        }
    }

    deleteAccount(name) {
        let index = this.indexInAccount(name);
        if (index > -1) {
            this.accounts.splice(index, 1);
            this.storeAccToFile();
        } else {
            throw new Error("Not possible to delete")
        }

    }

    addAccount(account) {
        let index = this.indexInAccount(account.name);
        if (index === -1) {
            this.accounts.push(account);
            this.storeAccToFile();
        } else throw new Error("Account exists");
    }

    storeAccToFile() {
        let data = JSON.stringify(this.accounts);
        if (this.dataEncrypted) {
            let promise = this.crypto.encryptString(data, this.key);
            promise.then(function (ciphertext) {
                data = new TextDecoder("utf-8").decode(ciphertext.message.packets.write());
            });
        }
        let path = "";
        if (app === undefined) {
            path = "Files"
        }
        else path = app.getPath("userData");
        let err = fs.writeFileSync(path + '/eauth.data', data);
        return err;
    }


    setKey(key) {
        this.key = key;
        try {
            let cryptoPromise = this.crypto.decryptString(this.enryptedData, key);
            cryptoPromise.then(function (plaintext) {
                this.parseData(plaintext.data);
            })
        }
        catch (e) {
            if (e !== "Invalid data") {
                throw new Error("invalid password");
            }
        }
    }

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

    isDataEncrypted() {
        return this.dataEncrypted;
    }

    existsFileInPath() {
        return this.existsFile;
    }


    isNameDuplicate(name) {
        return !(this.indexInAccount(name) === -1);
    }


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

    serialize() {
        return {
            existsFile : this.existsFile,
            dataEncrypted : this.dataEncrypted,
            accounts : this.accounts,
            key : this.key,
            enryptedData : this.enryptedData,
        }
    }

};
