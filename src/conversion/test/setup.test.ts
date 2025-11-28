import { expect, describe, it } from 'vitest';
(globalThis as any).expect = expect;

describe('setup', () => {
  it('noop', () => {
    expect(true).to.be.true;
  });
});
