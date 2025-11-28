import * as bc from '#pkg';
import {describe, expect, it} from 'vitest';

describe('hexToBuf', () => {
  const tests = [
    {buf: new Uint8Array([9, 255]), hex: '09ff'},
    {buf: new Uint16Array([5, 256]), hex: '05000001'},
    {buf: new ArrayBuffer(2), hex: '000'},
    {buf: new Uint8Array([1, 1]), hex: '0x101'},
    {buf: new Uint8Array([1, 1, 1]), hex: '10101'}
  ];

  describe('hexToBuf and bufToHex', () => {
    for (const test of tests) {
      describe(`bufToHex([${(new Uint8Array(test.buf)).toString()}])`, () => {
        const byteLength = test.buf.byteLength;
        const expected = bc.parseHex(test.hex, false, byteLength);
        it(`should return ${String(expected)}`, () => {
          const ret = bc.bufToHex(test.buf);
          expect(ret).to.equal(expected);
        });
      });
      describe(`bufToHex(hexToBuf(${test.hex}))`, () => {
        const byteLength = test.buf.byteLength;
        const expected = bc.parseHex(test.hex, false, byteLength);
        it(`should return ${String(expected)}`, () => {
          const buf = bc.hexToBuf(test.hex);
          const ret = bc.bufToHex(buf);
          expect(ret).to.equal(expected);
        });
      });
      describe('hexToBuf(\'12412fgt3\')', () => {
        it('should throw RangeError', () => {
          expect(() => bc.hexToBuf('12412fgt3')).to.throw(RangeError);
        });
      });
    }
  });
});
