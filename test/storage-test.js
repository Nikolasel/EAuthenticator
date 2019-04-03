/*
* An Electron Desktop app compatible with Google Authenticator.
* Copyright (C) 2018  Nikolas Eller

* This program is free software: you can redistribute it and/or modify
* it under the terms of the GNU General Public License as published by
* the Free Software Foundation, either version 3 of the License, or
* (at your option) any later version.

* This program is distributed in the hope that it will be useful,
* but WITHOUT ANY WARRANTY; without even the implied warranty of
* MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
* GNU General Public License for more details.

* You should have received a copy of the GNU General Public License
* along with this program. If not, see <http://www.gnu.org/licenses/>.
*/

let assert = require('assert');
let fs = require('fs');
let TOTP = require('../lib/totp');
let StorageEngine = require('../lib/storage');
let ChaCha20 = require('js-chacha20/src/jschacha20');
let textEncoding = require('text-encoding');
let TextDecoder = textEncoding.TextDecoder;
let storage;
let storage1;
let storage2;
let storage3;



describe('Storage Test', function () {
    before(function () {
        storage1 = new StorageEngine("Files/eauth.data.falsepassword.gpg"); //password '1234'
        storage3 = new StorageEngine("Files/eauth.data.falsepassword.gpg"); //password '1234'
        storage2 = new StorageEngine("Files/eauth.data.gpg");
        setTimeout(function(){

        }, 1000);
        unlockStorage(storage1, '1234');
    });

    beforeEach(function () {
        setTimeout(function(){
        }, 1000);
    });

    it('Check Storage: no file', function () {
        let storage = new StorageEngine("Files/noFile");
        assert.deepStrictEqual(storage.noFileFound(), true);
    });
    it('Check Storage: no valid file', function () {
        assert.throws(function () {
            new StorageEngine("Files/eauth.data");
        }, Error, "Error during parsing. This message / key probably does not conform to a valid OpenPGP format.");
    });
    it('Check Storage: valid file not default password', function () {
        assert.deepStrictEqual(storage3.needPassword(), true);
    });
    it('Check Storage: valid file default password', function () {
        assert.deepStrictEqual(storage2.needPassword(), false);
    });

    it('Check Storage: change Password successful', function () {
        storage2.changePassword("defaultPassword", "hallo");
        let dec = new TextDecoder;
        let decryptedPassword = dec.decode(new ChaCha20(storage2.keyPassword, storage2.keyPasswordNonce).decrypt(storage2.chaChaPassword));
        assert.deepStrictEqual(decryptedPassword, "hallo");
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
        assert.deepStrictEqual(decryptedPassword, '1234');
        assert.deepStrictEqual(decryptedAccounts, '[{"name":"test","secret":"blala"}]');
    });

    it('Check Storage: check lock storage', function () {
        let oldKeyPassword = storage2.keyPassword;
        let oldKeyPasswordNonce = storage2.keyPasswordNonce;
        let oldKeyAccounts = storage2.keyAccount;
        let oldKeyAccountNonce = storage2.keyAccountNonce;
        storage2.pathToFile = "Files/test.gpg";
        let promise = storage2.lockFile();
        promise.then(function () {
            assert.deepStrictEqual(storage2.chaChaAccounts, '');
            assert.deepStrictEqual(storage2.chaChaPassword, '');
            assert.notDeepStrictEqual(storage2.keyAccount, oldKeyAccounts);
            assert.notDeepStrictEqual(storage2.keyAccountNonce, oldKeyAccountNonce);
            assert.notDeepStrictEqual(storage2.keyPassword, oldKeyPassword);
            assert.notDeepStrictEqual(storage2.keyPasswordNonce, oldKeyPasswordNonce);
            fs.unlinkSync("Files/test.gpg");
        });
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
        assert.deepStrictEqual(result.length, 1);
        assert.deepStrictEqual(result[0].name, 'test');
        assert.deepStrictEqual(result[0].pin, totpPin);
    });


    it('Check Storage: rename account', function () {
        storage.renameAccount('test', 'newTest');
        let result = storage.getAllAccounts();
        assert.deepStrictEqual(result.length, 1);
        assert.deepStrictEqual(result[0].name, 'newTest');
    });

    it('Check Storage: delete account valid', function () {
        storage.deleteAccount('newTest');
        let result = storage.getAllAccounts();
        assert.deepStrictEqual(result.length, 0);
    });

    it('Check Storage: add account valid', function () {
        let account = {name: "test", secret: "blala"};
        storage.addAccount(account);
        let result = storage.getAllAccounts();
        assert.deepStrictEqual(result.length, 1);
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
    storage.unlockFile(password).then(function () {
        console.log("Unlock Storage successful!");
    });
}