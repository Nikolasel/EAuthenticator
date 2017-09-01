let assert = require('assert');
let HOTP = require('../lib/hotp.js');
let TOTP = require('../lib/totp.js');
let secret = 'EK6QV7UW64YOSIDB';
let hotp = new HOTP(secret);
let counter = 0;


describe('HOTP Test', function(){
    it('Check Base32', function () {
      assert.equal(hotp.b32ToHex("YAA54OXY"), "c001de3af8");
    });
    it('check DT', function(){
       assert.equal(hotp.dynamicTruncation("1f8698690e02ca16618550ef7f19da8e945b555a"), "50ef7f19", "false");
    });
    it('HOTP Value', function(){
        assert.equal(hotp.getHotpValue("50ef7f19"), 872921, "false");
    });
    it('Complete Test', function(){
        assert.equal(hotp.getPin(counter), 540854);
    });
    it('RFC Test', function(){
        let se = 'GEZDGNBVGY3TQOJQGEZDGNBVGY3TQOJQ';
        let h = new HOTP(se);
        assert.equal(h.getPin(0), 755224);
        assert.equal(h.getPin(1), 287082);
        assert.equal(h.getPin(2), 359152);
        assert.equal(h.getPin(3), 969429);
        assert.equal(h.getPin(4), 338314);
    });
});

describe('TOTP Test', function(){
    it('RFC Test', function(){
       let sec = 'GEZDGNBVGY3TQOJQGEZDGNBVGY3TQOJQ';
       let h = new TOTP(sec);
       assert.equal(h.getPinWithTime(new Date(1970, 1, 1, 0, 0, 59)), 110493);
       let totp = new TOTP(secret);
       console.log(totp.getPinAsString())
    });
});
