import { performance } from 'node:perf_hooks';
import BN from 'bn.js';
const conv = await import('./conversion/src/ts/index');

type BenchCase = {
  name: string;
  fn: () => unknown;
};

type BenchResult = {
  name: string;
  opsPerSec: number;
  nsPerOp: number;
  runs: number;
};

function runCase(test: BenchCase, targetMs = 300): BenchResult {
  // Warmup
  for (let i = 0; i < 2000; i++) test.fn();

  let iterations = 1024;
  let elapsed = 0;

  while (elapsed < targetMs) {
    const start = performance.now();
    for (let i = 0; i < iterations; i++) test.fn();
    elapsed = performance.now() - start;
    if (elapsed < targetMs) iterations *= 2;
    if (iterations > 1 << 24) break;
  }

  const opsPerSec = (iterations / elapsed) * 1000;
  const nsPerOp = (elapsed * 1e6) / iterations;
  return { name: test.name, opsPerSec, nsPerOp, runs: iterations };
}

function printResult(r: BenchResult): void {
  const ops = r.opsPerSec >= 100 ? r.opsPerSec.toFixed(0) : r.opsPerSec.toFixed(2);
  const ns = r.nsPerOp.toFixed(2);
  console.log(`${r.name}: ${ops} ops/s ${ns} ns/op (${r.runs} runs)`);
}

const smallHex = 'deadbeef';
const smallBuf = Buffer.from(smallHex, 'hex');
const smallString = `0x${smallHex}`;

const midHex = 'badc0ffee0ddf00d';
const midBuf = Buffer.from(midHex, 'hex');
const midString = `0x${midHex}`;

const hugeHex =
  'badc0ffee0ddf00dbadc0ffee0ddf00dbadc0ffee0ddf00dbadc0ffee0ddf00dbadc0ffee0ddf00dbadc0ffee0ddf00d';
const hugeBuf = Buffer.from(hugeHex, 'hex');
const hugeString = `0x${hugeHex}`;

const smallValue = 12345678n;
const largeValue = BigInt(
  '0xbadc0ffee0ddf00dbadc0ffee0ddf00dbadc0ffee0ddf00dbadc0ffee0ddf00dbadc0ffee0ddf00dbadc0ffee0ddf00d'
);

const bnSmallValue = new BN('12345678', 10);
const bnLargeValue = new BN(
  'badc0ffee0ddf00dbadc0ffee0ddf00dbadc0ffee0ddf00dbadc0ffee0ddf00dbadc0ffee0ddf00dbadc0ffee0ddf00d',
  16
);

const bigIntToBufferWithStringBE = (n: bigint, width: number): Buffer => {
  const hex = n.toString(16);
  return Buffer.from(hex.padStart(width * 2, '0').slice(0, width * 2), 'hex');
};

const bigIntToBufferWithStringLE = (n: bigint, width: number): Buffer => {
  const hex = n.toString(16);
  const out = Buffer.from(hex.padStart(width * 2, '0').slice(0, width * 2), 'hex');
  out.reverse();
  return out;
};

const b1 = Buffer.from('0123456789ABCDEF0123456789ABCDEF', 'hex');
const b2 = Buffer.from('0123456789ABCDEF0123456789ABCDEF', 'hex');
const bn1 = new BN('0123456789ABCDEF0123456789ABCDEF', 'hex');
const bn2 = new BN('0123456789ABCDEF0123456789ABCDEF', 'hex');
const n1 = 0x0123456789ABCDEFn;
const n2 = 0x0123456789ABCDEFn;

const cases: BenchCase[] = [
  { name: 'no-op', fn: () => undefined },

  { name: 'bigint from hex string (small)', fn: () => BigInt(smallString) },
  { name: 'bigint from hex string from buffer (small)', fn: () => BigInt(`0x${smallBuf.toString('hex')}`) },
  { name: 'BN from hex string from buffer (small)', fn: () => new BN(smallBuf.toString('hex'), 16) },
  { name: 'LE bigint-buffer ToBigInt (small)', fn: () => conv.toBigIntLE(smallBuf) },
  { name: 'BE bigint-buffer ToBigInt (small)', fn: () => conv.toBigIntBE(smallBuf) },

  { name: 'bigint from hex string (mid, aligned)', fn: () => BigInt(midString) },
  { name: 'bigint from hex string from buffer (mid, aligned)', fn: () => BigInt(`0x${midBuf.toString('hex')}`) },
  { name: 'BN from hex string from buffer (mid, aligned)', fn: () => new BN(midBuf.toString('hex'), 16) },
  { name: 'LE bigint-buffer ToBigInt (mid, aligned)', fn: () => conv.toBigIntLE(midBuf) },
  { name: 'BE bigint-buffer ToBigInt (mid, aligned)', fn: () => conv.toBigIntBE(midBuf) },

  { name: 'bigint from hex string (huge)', fn: () => BigInt(hugeString) },
  { name: 'bigint from hex string from buffer (huge)', fn: () => BigInt(`0x${hugeBuf.toString('hex')}`) },
  { name: 'BN from hex string from buffer (huge)', fn: () => new BN(hugeBuf.toString('hex'), 16) },
  { name: 'LE bigint-buffer ToBigInt (huge)', fn: () => conv.toBigIntLE(hugeBuf) },
  { name: 'BE bigint-buffer ToBigInt (huge)', fn: () => conv.toBigIntBE(hugeBuf) },

  { name: 'LE bigint to hex string to buffer (small)', fn: () => bigIntToBufferWithStringLE(smallValue, 8) },
  { name: 'BE bigint to hex string to buffer (small)', fn: () => bigIntToBufferWithStringBE(smallValue, 8) },
  { name: 'BN to buffer (small)', fn: () => bnSmallValue.toArrayLike(Buffer, 'be', 8) },
  { name: 'LE bigint-buffer to buffer (small)', fn: () => conv.toBufferLE(smallValue, 8) },
  { name: 'BE bigint-buffer to buffer (small)', fn: () => conv.toBufferBE(smallValue, 8) },

  { name: 'LE bigint to hex string to buffer (large)', fn: () => bigIntToBufferWithStringLE(largeValue, 48) },
  { name: 'BE bigint to hex string to buffer (large)', fn: () => bigIntToBufferWithStringBE(largeValue, 48) },
  { name: 'BN to buffer (large)', fn: () => bnLargeValue.toArrayLike(Buffer, 'be', 48) },
  { name: 'LE bigint-buffer to buffer (large)', fn: () => conv.toBufferLE(largeValue, 48) },
  { name: 'BE bigint-buffer to buffer (large)', fn: () => conv.toBufferBE(largeValue, 48) },

  { name: 'LE bigint-buffer to buffer (large, truncated)', fn: () => conv.toBufferLE(largeValue, 8) },
  { name: 'BE bigint-buffer to buffer (large, truncated)', fn: () => conv.toBufferBE(largeValue, 8) },

  { name: 'Buffer equality comparison', fn: () => b1.compare(b2) === 0 },
  { name: 'BN equality comparison', fn: () => bn1.eq(bn2) },
  { name: 'bigint equality comparison', fn: () => n1 === n2 },
  { name: 'BN multiply', fn: () => bn1.mul(bn2) },
  { name: 'bigint multiply', fn: () => n1 * n2 },
];

for (const test of cases) {
  try {
    printResult(runCase(test));
  } catch (err) {
    console.error(`${test.name} error:`, err);
  }
}
