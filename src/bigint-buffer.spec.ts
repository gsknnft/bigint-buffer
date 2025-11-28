import { describe, it, expect } from 'vitest';

describe('bigint-buffer', () => {
  it('should convert bigint to buffer and back', () => {
    // Example test, replace with real logic
    const big = BigInt('12345678901234567890');
    const buf = Buffer.from(big.toString(16), 'hex');
    const result = BigInt('0x' + buf.toString('hex'));
    expect(result).toBe(big);
  });
});
