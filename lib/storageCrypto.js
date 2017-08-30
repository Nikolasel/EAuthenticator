let fs = require('fs');
let openpgp = require('openpgp'); // use as CommonJS, AMD, ES6 module or via window.openpgp
let textEncoding = require('text-encoding');
let TextDecoder = textEncoding.TextDecoder;
let TextEncoder = textEncoding.TextEncoder;

module.exports = class StorageCrypto {

    static testDecrypt() {

        let data = fs.readFileSync('file.txt.gpg');
        openpgp.initWorker({ path:'openpgp.worker.js' })


        let options = {
            message: openpgp.message.read(data), // parse encrypted bytes
            password: 'abc',                 // decrypt with password
            format: 'binary'                          // output as Uint8Array
        };

        return openpgp.decrypt(options);


    }

    static testEncrypt() {
        let string = 'bösdasödöadösbösdasödöadösbösdasödöadösbösdasödöadösbösdasödöadösbösdasödöadösbösdasödöadösbösdasödöadösbösdasödöadösbösdasödöadösbösdasödöadös\n'
        //let uint8array = new TextEncoder("utf-8").encode(string);

        let options = {
            data: string, // input as Uint8Array (or String)
            passwords: ['abc'],              // multiple passwords possible
            armor: false                              // don't ASCII armor (for Uint8Array output)
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
}