import * as bc from '#pkg';
import {describe, expect, it} from 'vitest';

describe('hexToBigint', () => {
  const inputs = [
    {bi: BigInt(1), hex: '1'}, {bi: BigInt(31), hex: '1F'}, {
      bi: BigInt('12485413541784539569456874935679853424678352483761'),
      hex: '88af94e6b1e99f8bf3b01edb619caaa656A5c75b1'
    }
  ];

  describe('hexToBigint', () => {
    for (const input of inputs) {
      describe(`hexToBigint(${input.hex})`, () => {
        it(`should return ${input.bi}`, () => {
          const ret = bc.hexToBigint(input.hex);
          expect(ret).to.equal(input.bi);
        });
      });
    }
  });
});
