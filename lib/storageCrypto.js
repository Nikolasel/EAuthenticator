let openpgp = require('openpgp'); // use as CommonJS, AMD, ES6 module or via window.openpgp

/**
 * Class that handles the crypto for storage
 * @type {module.StorageCrypto}
 */
module.exports = class StorageCrypto {

    constructor() {
        //openpgp.initWorker({ path:'openpgp.worker.js' });
    }

    /**
     * Encrypts a string
     * @param string
     * @param key
     * @returns {Promise}
     */
    encryptString(string, key) {
        let options = {
            data : string,
            passwords: [key],
            armor: true,
        };
        return openpgp.encrypt(options);
    }

    /**
     * Decrypts a string
     * @param string
     * @param key
     * @returns {Promise}
     */
    decryptString(string, key) {
        let message =  openpgp.message.read(string);
        let options = {
            message: message,
            password: key,
            format: 'utf8',
        };
        return openpgp.decrypt(options);
    }

    /**
     * Checks if data is encrypted
     * @param data
     * @returns {boolean}
     */
    checkDataIsEncrypted(data) {
        try {
            openpgp.message.read(data);
            return true;
        }
        catch (e) {
            return e.message !== "Error during parsing. This message / key probably does not conform to a valid OpenPGP format.";
        }
    }
};