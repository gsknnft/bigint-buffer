import * as bc from '#pkg';
import { describe, it, expect } from 'vitest';

describe('bufToBigint', () => {
  const tests = [
    {
      input: new Uint32Array(2),
      output: BigInt(0)
    },
    {
      input: bc.hexToBuf('ffffffff'),
      output: BigInt('4294967295')
    },
    {
      input: new Uint16Array(bc.hexToBuf('ffffffff', true)),
      output: BigInt('4294967295')
    }
  ];
  for (const test of tests) {
    describe(`bufToBigint(${String(bc.bufToHex(test.input))})`, () => {
      it(`should return ${String(test.output.toString())}`, () => {
        const ret = bc.bufToBigint(test.input);
        expect(ret.toString()).to.equal(test.output.toString());
      });
    });
  }
});
