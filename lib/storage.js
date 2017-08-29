let fs = require('fs');
const remote = require('electron').remote;
let app = undefined;
if (remote !== undefined) app = remote.app;


module.exports = class StorageEngine {

    constructor() {
        // Set Standard value
        this.existsFile = true;
        this.dataEncrypted = false;
        this.accounts = [];
        //Key saved as SHA-256 hex string
        this.key = "";

        let path = "";
        if (app === undefined) {
            path = "Files"
        }
        else path = app.getPath("userData");
        try {
            let data = fs.readFileSync(path + '/eauth.data');
            // TODO with storageCrypto check if it is encrypted
            this.dataEncrypted = false;
            if (!this.dataEncrypted) {
                this.parseData(data);
            }
        }
        catch (e) {
            this.existsFile = false;
        }
    }


    getAllAccounts() {
        return this.accounts;
    }

    getAccount(name) {
        let index = this.indexInAccount(name);
        if(index > -1) {
            return this.accounts[index];
        } else {
            throwError("No Account with this name");
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
        if(index === -1) {
            this.accounts.push(account);
            this.storeAccToFile();
        } else throw  new Error("Account exists");
    }

    storeAccToFile() {
        let data = JSON.stringify(this.accounts);
        if(this.dataEncrypted) {
            // data = encrypt(data)
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

    }

    // data musst be json
    // [{'name' : "bla", 'secret': "AAAAA"}, {'name' : "bla2", 'secret': "BBBBB"}]
    parseData(data) {
        this.accounts = JSON.parse(data);
    }

    isDataEncrypted() {
        return this.dataEncrypted;
    }

    existsFileInPath(){
        return this.existsFile;
    }


    indexInAccount(name) {
        let index = -1;
        for (let i = 0; i < this.accounts.length; i++) {
            if(this.accounts[i].name === name) {
                index = i;
                break;
            }
        }
        return index;
    }


};
