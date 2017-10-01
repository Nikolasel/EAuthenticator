let openpgp = require('openpgp'); // use as CommonJS, AMD, ES6 module or via window.openpgp


module.exports = class StorageCrypto {

    constructor() {
        //openpgp.initWorker({ path:'openpgp.worker.js' });
    }

    encryptString(string, key) {
        let options = {
            data : string,
            passwords: [key],
            armor: false,
        };
        return openpgp.encrypt(options);
    }

    decryptString(string, key) {
        let message =  openpgp.message.read(string);
        let options = {
            message: message,
            password: key,
            format: 'utf8',
        };
        return openpgp.decrypt(options);
    }

    checkDataIsEncrypted(data) {
        try {
            openpgp.message.read(data);
            return true;
        }
        catch (e) {
            if(e.message === "Error during parsing. This message / key probably does not conform to a valid OpenPGP format.") {
                return false;
            }
            else return true;
        }
    }
};