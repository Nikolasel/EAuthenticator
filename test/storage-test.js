let assert = require('assert');
let StorageEngine = require('../lib/storage');


describe('Storage Test', function() {
    it('Check Storage', function () {
        let storage = new StorageEngine();
        assert.equal(storage.isDataEncrypted(), false);
        assert.equal(storage.existsFileInPath(), true);
        assert.equal(storage.getAllAccounts().length, 1);
        assert.throws(function() {storage.addAccount({name : "test", secret : "blala"})}, Error, "Account exits");
        assert.deepEqual(storage.getAccount("test"), {name : "test", secret : "blala"});
        storage.deleteAccount("test");
        assert.equal(storage.getAllAccounts().length, 0);
        let stor2 = new StorageEngine();
        assert.equal(stor2.existsFileInPath(), true);
        assert.equal(stor2.getAllAccounts().length, 0);
        storage.addAccount({name : "test", secret : "blala"})
    });
});