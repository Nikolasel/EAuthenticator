let fs = require('fs');
let openpgp = require('openpgp'); // use as CommonJS, AMD, ES6 module or via window.openpgp


module.exports = class StorageCrypto {

    static testDecrypt() {

        let data = fs.readFileSync('file.txt.gpg');
        openpgp.initWorker({ path:'openpgp.worker.js' });


        let options = {
            message: openpgp.message.read(data), // parse encrypted bytes
            password: 'abc',                 // decrypt with password
            format: 'utf8'                          // output as Uint8Array
        };

        return openpgp.decrypt(options);


    }

    static testEncrypt() {
        let string = 'bösdasödöadösbösdasödöadösbösdasödöadösbösdasödöadösbösdasödöadösbösdasödöadösbösdasödöadösbösdasödöadösbösdasödöadösbösdasödöadösbösdasödöadös\n';

        let options = {
            data: string, // input as Uint8Array (or String)
            passwords: ['abc'],              // multiple passwords possible
            armor: false,                              // don't ASCII armor (for Uint8Array output)
        };

        return openpgp.encrypt(options);
    }

    static encryptString(string) {

    }

    static decryptString(string) {

    }

    static key2HashKey(key) {

    }


    static checkDataIsEncrypted(data) {

    }
};