import {describe, expect, it} from 'vitest';

(globalThis as {expect?: typeof expect}).expect = expect;

describe('setup', () => {
  it('noop', () => {
    expect(true).to.equal(true);
  });
});
