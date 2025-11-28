import * as bc from '#pkg';
import {describe, expect, it} from 'vitest';

describe('bigintToBuf', () => {
  const inputs = [
    BigInt(0), BigInt(3855), BigInt(19),
    BigInt(
        '987597451974567914535761247965237569172456791242479651917245614514261463156346357315735752714364354354647135713476134634753735714534636'),
    BigInt(-5)
  ];

  for (const input of inputs) {
    describe(`bufToBigint(bigintToBuf(${input}))`, () => {
      if (input < 0) {
        it('should throw RangeError', () => {
          expect(() => bc.bufToBigint(bc.bigintToBuf(input)))
              .to.throw(RangeError);
        });
        it('should throw RangeError', () => {
          expect(() => bc.bufToBigint(bc.bigintToBuf(input, true)))
              .to.throw(RangeError);
        });
        it('should throw RangeError', () => {
          expect(() => bc.bufToBigint(bc.bigintToBuf(input, false)))
              .to.throw(RangeError);
        });
      } else {
        it(`should return ${input}`, () => {
          const ret = bc.bufToBigint(bc.bigintToBuf(input));
          expect(ret).to.equal(input);
        });
        it(`should return ${input}`, () => {
          const ret = bc.bufToBigint(bc.bigintToBuf(input, true));
          expect(ret).to.equal(input);
        });
        it(`should return ${input}`, () => {
          const ret = bc.bufToBigint(bc.bigintToBuf(input, false));
          expect(ret).to.equal(input);
        });
      }
    });
  }
});
