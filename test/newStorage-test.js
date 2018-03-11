let assert = require('assert');
let TOTP = require('../lib/totp');
let StorageEngine = require('../lib/newStorage');
let ChaCha20 = require('js-chacha20/src/jschacha20');
let textEncoding = require('text-encoding');
let TextDecoder = textEncoding.TextDecoder;
let storage;
let storage1;
let storage2;



describe('Storage Test', function () {
    before(function () {
        storage1 = new StorageEngine("Files/eauth.data.falsepassword.gpg"); //password '1234'
        storage2 = new StorageEngine("Files/eauth.data.gpg");
        setTimeout(function(){

        }, 1000);
        unlockStorage(storage1, '1234');
    });

    beforeEach(function () {
        setTimeout(function(){
            console.log("waited 1000");
        }, 1000);
    });

    it('Check Storage: no file', function () {
        let storage = new StorageEngine("../Files/noFile");
        assert.equal(storage.noFileFound(), true);
    });
    it('Check Storage: no valid file', function () {
        assert.throws(function () {
            new StorageEngine("Files/eauth.data");
        }, Error, "Error during parsing. This message / key probably does not conform to a valid OpenPGP format.");
    });
    it('Check Storage: valid file not default password', function () {
        assert.equal(storage1.needPassword(), true);
    });
    it('Check Storage: valid file default password', function () {
        assert.equal(storage2.needPassword(), false);
    });

    it('Check Storage: change Password successful', function () {
        storage2.changePassword("defaultPassword", "hallo");
        let dec = new TextDecoder;
        let decryptedPassword = dec.decode(new ChaCha20(storage2.keyPassword, storage2.keyPasswordNonce).decrypt(storage2.chaChaPassword));
        assert.equal(decryptedPassword, "hallo");
    });

    it('Check Storage: change Password unsuccessful', function () {
        assert.throws(function () {
            storage2.changePassword("defaultPass", "hallo");
        }, Error, "Incorrect old password");
    });

    it('Check Storage: check unlock storage1', function () {
        let dec = new TextDecoder;
        let decryptedPassword = dec.decode(new ChaCha20(storage1.keyPassword, storage1.keyPasswordNonce).decrypt(storage1.chaChaPassword));
        let decryptedAccounts = dec.decode(new ChaCha20(storage1.keyAccount, storage1.keyAccountNonce).decrypt(storage1.chaChaAccounts));
        assert.equal(decryptedPassword, '1234');
        assert.equal(decryptedAccounts, '[{"name":"test","secret":"blala"}]');
    });

    it('Check Storage: check lock storage', function () {
        let oldKeyPassword = storage2.keyPassword;
        let oldKeyPasswordNonce = storage2.keyPasswordNonce;
        let oldKeyAccounts = storage2.keyAccount;
        let oldKeyAccountNonce = storage2.keyAccountNonce;
        storage2.pathToFile = "Files/test.gpg";
        storage2.lockFile();
        assert.equal(storage2.chaChaAccounts, '');
        assert.equal(storage2.chaChaPassword, '');
        assert.notEqual(storage2.keyAccount, oldKeyAccounts);
        assert.notEqual(storage2.keyAccountNonce, oldKeyAccountNonce);
        assert.notEqual(storage2.keyPassword, oldKeyPassword);
        assert.notEqual(storage2.keyPasswordNonce, oldKeyPasswordNonce);
    });
});


describe('Storage Test: Account functions', function () {
    before(function () {
        storage = new StorageEngine("Files/eauth.data.gpg");
        setTimeout(function(){
        }, 1000);

    });


    it('Check Storage: get All Accounts', function () {
        let result = storage.getAllAccounts();
        let totpPin = new TOTP("blala").getPinAsString();
        assert.equal(result.length, 1);
        assert.equal(result[0].name, 'test');
        assert.equal(result[0].pin, totpPin);
    });


    it('Check Storage: rename account', function () {
        storage.renameAccount('test', 'newTest');
        let result = storage.getAllAccounts();
        assert.equal(result.length, 1);
        assert.equal(result[0].name, 'newTest');
    });

    it('Check Storage: delete account valid', function () {
        storage.deleteAccount('newTest');
        let result = storage.getAllAccounts();
        assert.equal(result.length, 0);
    });

    it('Check Storage: add account valid', function () {
        let account = {name: "test", secret: "blala"};
        storage.addAccount(account);
        let result = storage.getAllAccounts();
        assert.equal(result.length, 1);
    });

    it('Check Storage: add account invalid', function () {
        let account = {name: "test", secret: "blala"};
        assert.throws(function () {
            storage.addAccount(account);
        }, Error, "Account already exists");

    });

    it('Check Storage: delete account invalid', function () {
        assert.throws(function () {
            storage.deleteAccount('newTest');
        }, Error, "Not possible to delete");
    });
});

function unlockStorage(storage, password) {
    storage.unlockFile(password, false);
}