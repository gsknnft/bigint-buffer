import * as bc from '#pkg';
import {describe, expect, it} from 'vitest';

describe('bigintToBase64', () => {
  const inputs = [
    {bi: BigInt(1), base64: 'AQ', urlsafe: true, padding: false},
    {bi: BigInt(31), base64: 'Hw==', urlsafe: true, padding: undefined},
    {bi: BigInt(3855), base64: 'Dw8', urlsafe: undefined, padding: false}, {
      bi: BigInt('12485413541784539569456874935679853424678352483761'),
      base64: 'CIr5Tmsemfi/OwHtthnKqmVqXHWx',
      urlsafe: false,
      padding: true
    },
    {bi: BigInt('-4'), base64: '', urlsafe: true, padding: false}
  ];

  for (const input of inputs) {
    if (input.bi >= 0) {
      describe(`bigintToBase64(${input.bi})`, () => {
        it(`should return ${input.base64}`, () => {
          const ret = bc.bigintToBase64(input.bi, input.urlsafe, input.padding);
          expect(ret).to.equal(input.base64);
        });
      });
      describe(`base64ToBigint(${input.base64})`, () => {
        it(`should return ${input.bi}`, () => {
          const ret = bc.base64ToBigint(input.base64);
          expect(ret).to.equal(input.bi);
        });
      });
    } else {
      it('should throw RangeError', () => {
        expect(() => bc.bigintToHex(input.bi)).to.throw(RangeError);
      });
    }
  }
});
