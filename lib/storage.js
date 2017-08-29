//app.getPath('userData') path for userdata
let fs = require('fs');
const remote = require('electron').remote;
let app = undefined;
if (remote !== undefined) app = remote.app;


module.exports = class StorageEngine {

    constructor() {
        // Set Standard value
        this.hasData = true;
        this.dataEncrypted = false;
        this.accounts = [];
        //Key saved as SHA-256 hex string
        this.key = "";

        let path = "";
        if (app === undefined) {
            path = "/Users/nicki"
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
            this.hasData = false;
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
            throwError("Not possible to delete")
        }

    }

    addAccount(account) {
        let index = this.indexInAccount(account.name);
        if(index === -1) {
            this.accounts.push(account);
            this.storeAccToFile();
        } else throwError("Account exists");
    }

    storeAccToFile() {
        let data = JSON.stringify(this.accounts);
        if(this.dataEncrypted) {
            // data = encrypt(data)
        }
        let path = "";
        if (app === undefined) {
            path = "/Users/nicki"
        }
        else path = app.getPath("userData");
        fs.writeFile(path + '/eauth.data', data, function(err) {
            return err;
        });


    }

    setKey(key) {

    }

    // data musst be json
    // {'accounts' : [{'name' : "bla", 'secret': "AAAAA"}]}
    parseData(data) {
        this.accounts = JSON.parse(data);
    }

    isDataEncrypted() {
        return this.dataEncrypted;
    }

    hasAccountData() {
        return this.hasData;
    }

    indexInAccount(name) {
        let index = -1;
        for (let i = 0; i < this.accounts.length; i++) {
            if(this.accounts[i].name === name) {
                index = i;
                break;
            }
        }
    }


};
