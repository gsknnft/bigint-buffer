import * as bc from '#pkg';
import { describe, it, expect } from 'vitest';

describe('parseHex', function () {
  const vectors = [
    {
      input: '0x234FE678',
      output: '234FE678'
    },
    {
      input: '234FE687',
      output: '234FE687'
    },
    {
      input: '0x123546146f23A2',
      output: '123546146f23A2'
    }
  ];
  for (const vector of vectors) {
    it(`parseHex('${vector.input}') should return '${vector.output}'`, function () {
      const ret = bc.parseHex(vector.input);
      expect(ret).to.equal(vector.output);
    });
    it(`parseHex('${vector.input}', true) should return '0x${vector.output}'`, function () {
      const ret = bc.parseHex(vector.input, true);
      expect(ret).to.equal('0x' + vector.output);
    });
  }
  it('parseHex(\'adge3\') should throw error', function () {
    expect(() => {
      bc.parseHex('adge3');
    }).to.throw(RangeError);
  });
  it("parseHex('1287a3', undefined, 4) should return '001287a3'", function () {
    const ret = bc.parseHex('1287a3', undefined, 4);
    expect(ret).to.equal('001287a3');
  });
  it('parseHex(\'1287542fe21\', true, 4) should throw error', function () {
    expect(() => {
      bc.parseHex('1287542fe21', true, 4);
    }).to.throw(RangeError);
  });
});
