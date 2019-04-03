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
let HOTP = require('../lib/hotp.js');
let TOTP = require('../lib/totp.js');
let secret = 'EK6QV7UW64YOSIDB';
let hotp = new HOTP(secret);
let counter = 0;


describe('HOTP Test', function(){
    it('Check Base32', function () {
      assert.deepStrictEqual(hotp.b32ToHex("YAA54OXY"), "c001de3af8");
    });
    it('check DT', function(){
       assert.deepStrictEqual(hotp.dynamicTruncation("1f8698690e02ca16618550ef7f19da8e945b555a"), "50ef7f19", "false");
    });
    it('HOTP Value', function(){
        assert.deepStrictEqual(hotp.getHotpValue("50ef7f19"), 872921, "false");
    });
    it('Complete Test', function(){
        assert.deepStrictEqual(hotp.getPin(counter), 540854);
    });
    it('RFC Test', function(){
        let se = 'GEZDGNBVGY3TQOJQGEZDGNBVGY3TQOJQ';
        let h = new HOTP(se);
        assert.deepStrictEqual(h.getPin(0), 755224);
        assert.deepStrictEqual(h.getPin(1), 287082);
        assert.deepStrictEqual(h.getPin(2), 359152);
        assert.deepStrictEqual(h.getPin(3), 969429);
        assert.deepStrictEqual(h.getPin(4), 338314);
    });
});

describe('TOTP Test', function(){
    it('RFC Test', function(){
       let sec = 'GEZDGNBVGY3TQOJQGEZDGNBVGY3TQOJQ';
       let h = new TOTP(sec);
       assert.deepStrictEqual(h.getPinWithTime(new Date(1970, 1, 1, 0, 0, 59)), 110493);
    });
});
