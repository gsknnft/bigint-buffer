import * as bc from '#pkg';
import { describe, it, expect } from 'vitest';

describe('bigintToHex', function () {
  const inputs = [
    {
      bi: BigInt(1),
      hex: '1'
    },
    {
      bi: BigInt(31),
      hex: '1f'
    },
    {
      bi: BigInt(3855),
      hex: 'f0f'
    },
    {
      bi: BigInt('12485413541784539569456874935679853424678352483761'),
      hex: '88af94e6b1e99f8bf3b01edb619caaa656a5c75b1'
    },
    {
      bi: BigInt('-4'),
      hex: ''
    }
  ];

  describe('bigintToHex', function () {
    for (const input of inputs) {
      if (input.bi >= 0) {
        describe(`bigintToHex(${input.bi})`, function () {
          it(`should return ${input.hex}`, function () {
            const ret = bc.bigintToHex(input.bi);
            expect(ret).to.equal(input.hex);
          });
        });
      } else {
        it('should throw RangeError', function () {
          expect(() => bc.bigintToHex(input.bi)).to.throw(RangeError);
        });
      }
    }
    it("bigintToHex(1214371n, undefined, 4) should return '001287a3'", function () {
      const ret = bc.bigintToHex(1214371n, undefined, 4);
      expect(ret).to.equal('001287a3');
    });
    it("bigintToHex(1214371n, true) should return '0x1287a3'", function () {
      const ret = bc.bigintToHex(1214371n, true);
      expect(ret).to.equal('0x1287a3');
    });
    it("bigintToHex(1214371n, true, 5) should return '0x00001287a3'", function () {
      const ret = bc.bigintToHex(1214371n, true, 5);
      expect(ret).to.equal('0x00001287a3');
    });
    it('bigintToHex(hexToBigint(\'1287542fe21\'), true, 4) should throw error', function () {
      expect(() => {
        bc.bigintToHex(bc.hexToBigint('1287542fe21'), true, 4);
      }).to.throw(RangeError);
    });
    it("bigintToHex(1132n, true) should return '0x46c'", function () {
      const ret = bc.bigintToHex(1132n, true);
      expect(ret).to.equal('0x46c');
    });
  });
});
