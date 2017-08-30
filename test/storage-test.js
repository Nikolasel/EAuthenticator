let assert = require('assert');
let StorageEngine = require('../lib/storage');
let StorageCrypto = require('../lib/storageCrypto');
let textEncoding = require('text-encoding');
let TextDecoder = textEncoding.TextDecoder;


describe('Storage Test', function () {
    it('Check Storage', function () {
        let storage = new StorageEngine();
        assert.equal(storage.isDataEncrypted(), false);
        assert.equal(storage.existsFileInPath(), true);
        assert.equal(storage.getAllAccounts().length, 1);
        assert.throws(function () {
            storage.addAccount({name: "test", secret: "blala"})
        }, Error, "Account exits");
        assert.deepEqual(storage.getAccount("test"), {name: "test", secret: "blala"});
        storage.deleteAccount("test");
        assert.equal(storage.getAllAccounts().length, 0);
        let stor2 = new StorageEngine();
        assert.equal(stor2.existsFileInPath(), true);
        assert.equal(stor2.getAllAccounts().length, 0);
        storage.addAccount({name: "test", secret: "blala"})
    });
});

describe('Storage Crypto Test', function () {
    it('Check Storage', function () {
        StorageCrypto.testDecrypt().then(function (plaintext) {
            let string = new TextDecoder("utf-8").decode(plaintext.data);
            console.log(string);
            //plaintext.data // Uint8Array([0x01, 0x01, 0x01])
        });
    });
    it('Check Storage', function () {
        StorageCrypto.testEncrypt().then(function (ciphertext) {
            let string = new TextDecoder("utf-8").decode(ciphertext.message.packets.write());
            console.log(string);
            //plaintext.data // Uint8Array([0x01, 0x01, 0x01])
        });
    });
});