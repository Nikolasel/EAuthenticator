let assert = require('assert');
let StorageEngine = require('../lib/storage');


describe('Storage Test', function() {
    it('Check Storage', function () {
        let storage = new StorageEngine();
        assert.equal(storage.isDataEncrypted(), false);
        assert.equal(storage.hasAccountData(), true);
        storage.addAccount({name : "test", secret : "blala"});
    });
});