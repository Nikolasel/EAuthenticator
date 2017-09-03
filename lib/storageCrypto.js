let openpgp = require('openpgp'); // use as CommonJS, AMD, ES6 module or via window.openpgp


module.exports = class StorageCrypto {

    constructor() {
        openpgp.initWorker({ path:'openpgp.worker.js' });
    }


    /*testDecrypt() {

        let data = fs.readFileSync('file.txt.gpg');
        openpgp.initWorker({ path:'openpgp.worker.js' });


        let options = {
            message: openpgp.message.read(data), // parse encrypted bytes
            password: 'abc',                 // decrypt with password
            format: 'utf8'                          // output as Uint8Array
        };

        return openpgp.decrypt(options);


    }

    testEncrypt() {
        let string = 'bösdasödöadösbösdasödöadösbösdasödöadösbösdasödöadösbösdasödöadösbösdasödöadösbösdasödöadösbösdasödöadösbösdasödöadösbösdasödöadösbösdasödöadös\n';

        let options = {
            data: string, // input as Uint8Array (or String)
            passwords: ['abc'],              // multiple passwords possible
            armor: false,                              // don't ASCII armor (for Uint8Array output)
        };

        return openpgp.encrypt(options);
    }*/

    encryptString(string, key) {
        let options = {
            data : string,
            passwords: [key],
            armor: false,
        };
        return openpgp.encrypt(options);
    }

    decryptString(string, key) {
        let options = {
            message: openpgp.message.read(string),
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