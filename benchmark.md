# Benchmark Snapshot

Environment:
- Package: `@gsknnft/bigint-buffer@1.5.0`
- Runtime: `Node 24` on `win32 x64`
- Runner: `tsx src/index.bench.ts`
- Date: `2026-02-20`

## Results (ops/s, ns/op)

- LE bigint-buffer ToBigInt (small): 11,557,896 ops/s, 86.52 ns/op
- BE bigint-buffer ToBigInt (small): 11,645,445 ops/s, 85.87 ns/op
- LE bigint-buffer ToBigInt (mid, aligned): 10,877,869 ops/s, 91.93 ns/op
- BE bigint-buffer ToBigInt (mid, aligned): 10,869,145 ops/s, 92.00 ns/op
- LE bigint-buffer ToBigInt (huge): 7,476,468 ops/s, 133.75 ns/op
- BE bigint-buffer ToBigInt (huge): 7,522,035 ops/s, 132.94 ns/op

- LE bigint-buffer to buffer (small): 10,261,093 ops/s, 97.46 ns/op
- BE bigint-buffer to buffer (small): 9,572,074 ops/s, 104.47 ns/op
- LE bigint-buffer to buffer (large): 7,372,083 ops/s, 135.65 ns/op
- BE bigint-buffer to buffer (large): 7,329,966 ops/s, 136.43 ns/op
- LE bigint-buffer to buffer (large, truncated): 9,472,302 ops/s, 105.57 ns/op
- BE bigint-buffer to buffer (large, truncated): 10,317,251 ops/s, 96.93 ns/op

- BN to buffer (large): 5,555,777 ops/s, 179.99 ns/op
- BN multiply: 5,346,543 ops/s, 187.04 ns/op
- bigint multiply: 31,271,348 ops/s, 31.98 ns/op

## Reproduce

```bash
pnpm run benchmark
```
