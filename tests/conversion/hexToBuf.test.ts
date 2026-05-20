import {describe, expect, it} from 'vitest';
import { bufToHex, hexToBuf, parseHex } from '../../src/conversion';

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
        const expected = parseHex(test.hex, false, byteLength);
        it(`should return ${String(expected)}`, () => {
          const ret = bufToHex(test.buf);
          expect(ret).to.equal(expected);
        });
      });
      describe(`bufToHex(hexToBuf(${test.hex}))`, () => {
        const byteLength = test.buf.byteLength;
        const expected = parseHex(test.hex, false, byteLength);
        it(`should return ${String(expected)}`, () => {
          const buf = hexToBuf(test.hex);
          const ret = bufToHex(buf);
          expect(ret).to.equal(expected);
        });
      });
      describe('hexToBuf(\'12412fgt3\')', () => {
        it('should throw RangeError', () => {
          expect(() => hexToBuf('12412fgt3')).to.throw(RangeError);
        });
      });
    }
  });
});
