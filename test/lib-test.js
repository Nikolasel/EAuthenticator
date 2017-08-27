let assert = require('assert');
let HOTP = require('../lib/hotp.js');
let TOTP = require('../lib/totp.js');
let secret = 'EK6QV7UW64YOSIDB';
let totp = new TOTP(secret);
let hotp = new HOTP(secret);
let counter = 0;


describe('HOTP Test', function(){
    it('check DT', function(){
       assert.equal(hotp.dynamicTruncation("1f8698690e02ca16618550ef7f19da8e945b555a"), "50ef7f19", "false");
    });
    it('HOTP Value', function(){
        assert.equal(hotp.getHotpValue("50ef7f19"), 872921, "false");
    });
    it('Complete Test', function(){
        assert.equal(hotp.getPin(counter), 540854);
    });
});

describe('TOTP Test', function(){
    it('Complete Test', function(){
        //assert.equal(hotp.getPin(counter), 540854);
        console.log(totp.getPin());
    });
});
