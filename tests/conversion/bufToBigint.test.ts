import {describe, expect, it} from 'vitest';
import { hexToBuf, bufToHex, bufToBigint } from '../../src/conversion';

describe('bufToBigint', () => {
  const tests = [
    {input: new Uint32Array(2), output: BigInt(0)},
    {input: hexToBuf('ffffffff'), output: BigInt('4294967295')}, {
      input: new Uint16Array(hexToBuf('ffffffff', true)),
      output: BigInt('4294967295')
    }
  ];
  for (const test of tests) {
    describe(`bufToBigint(${String(bufToHex(test.input))})`, () => {
      it(`should return ${String(test.output.toString())}`, () => {
        const ret = bufToBigint(test.input);
        expect(ret.toString()).to.equal(test.output.toString());
      });
    });
  }
});
