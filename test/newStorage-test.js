let assert = require('assert');
let StorageEngine = require('../lib/newStorage');

let textEncoding = require('text-encoding');
let TextDecoder = textEncoding.TextDecoder;


describe('Storage Test', function () {
    it('Check Storage', function () {
        let storage = new StorageEngine("../Files/test.data");
        assert.equal(storage.noSuchFile, true);
    });
});

