import { beforeAll, describe, expect, it } from "vitest";

let lib: Awaited<typeof import("./index.js")>;
let toBigIntBE: Awaited<typeof import("./index.js")>["toBigIntBE"];
let toBigIntLE: Awaited<typeof import("./index.js")>["toBigIntLE"];
let toBufferBE: Awaited<typeof import("./index.js")>["toBufferBE"];
let toBufferLE: Awaited<typeof import("./index.js")>["toBufferLE"];
// Removed unused variable assignments to fix lint errors

beforeAll(async () => {
  lib = await import("./index.js");
  toBigIntBE = lib.toBigIntBE;
  toBigIntLE = lib.toBigIntLE;
  toBufferBE = lib.toBufferBE;
  toBufferLE = lib.toBufferLE;
  // Removed assignments to undeclared variables
});

const assertEquals = (n0: bigint, n1: bigint) => {
  expect(n0.toString(16)).toBe(n1.toString(16));
};

describe("Try buffer conversion (little endian)", () => {
  it("0 should equal 0n", () => {
    assertEquals(toBigIntLE(Buffer.from([0])), BigInt("0"));
  });

  it("1 should equal 1n", async () => {
    assertEquals(toBigIntLE(Buffer.from([1])), BigInt("1"));
  });

  it("0xdead should equal 0xdeadn", async () => {
    assertEquals(toBigIntLE(Buffer.from([0xad, 0xde])), BigInt("0xdead"));
  });

  it("0xdeadbeef should equal 0xdeadbeefn", async () => {
    assertEquals(
      toBigIntLE(Buffer.from([0xef, 0xbe, 0xad, 0xde])),
      BigInt("0xdeadbeef")
    );
  });

  it("0xbadc0ffee0 should equal 0xbadc0ffee0n", async () => {
    assertEquals(
      toBigIntLE(Buffer.from([0xe0, 0xfe, 0x0f, 0xdc, 0xba])),
      BigInt("0xbadc0ffee0")
    );
  });

  it("0xbadc0ffee0dd should equal 0xbadc0ffee0ddn", async () => {
    assertEquals(
      toBigIntLE(Buffer.from([0xdd, 0xe0, 0xfe, 0x0f, 0xdc, 0xba])),
      BigInt("0xbadc0ffee0dd")
    );
  });

  it("0xbadc0ffee0ddf0 should equal 0xbadc0ffee0ddf0n", async () => {
    assertEquals(
      toBigIntLE(Buffer.from([0xf0, 0xdd, 0xe0, 0xfe, 0x0f, 0xdc, 0xba])),
      BigInt("0xbadc0ffee0ddf0")
    );
  });

  it("0xbadc0ffee0ddf00d should equal 0xbadc0ffee0ddf00dn", async () => {
    assertEquals(
      toBigIntLE(Buffer.from([0x0d, 0xf0, 0xdd, 0xe0, 0xfe, 0x0f, 0xdc, 0xba])),
      BigInt("0xbadc0ffee0ddf00d")
    );
  });

  it("0xbadc0ffee0ddf00ddeadbeef should equal 0xbadc0ffee0ddf00ddeadbeefn", async () => {
    assertEquals(
      toBigIntLE(
        Buffer.from([
          0xef, 0xbe, 0xad, 0xde, 0x0d, 0xf0, 0xdd, 0xe0, 0xfe, 0x0f, 0xdc,
          0xba,
        ])
      ),
      BigInt("0xbadc0ffee0ddf00ddeadbeef")
    );
  });

  it("0xbadc0ffee0ddf00ddeadbeefbadc0ffee0ddf00ddeadbeef should equal 0xbadc0ffee0ddf00ddeadbeefbadc0ffee0ddf00ddeadbeefn", async () => {
    assertEquals(
      toBigIntLE(
        Buffer.from([
          0xef, 0xbe, 0xad, 0xde, 0x0d, 0xf0, 0xdd, 0xe0, 0xfe, 0x0f, 0xdc,
          0xba, 0xef, 0xbe, 0xad, 0xde, 0x0d, 0xf0, 0xdd, 0xe0, 0xfe, 0x0f,
          0xdc, 0xba,
        ])
      ),
      BigInt("0xbadc0ffee0ddf00ddeadbeefbadc0ffee0ddf00ddeadbeef")
    );
  });

  it("0xbadc0ffee0ddf00ddeadbeefbadc0ffee0ddf00ddeadbeefbeef should equal 0xbadc0ffee0ddf00ddeadbeefbadc0ffee0ddf00ddeadbeefbeefn", async () => {
    assertEquals(
      toBigIntLE(
        Buffer.from([
          0xef, 0xbe, 0xef, 0xbe, 0xad, 0xde, 0x0d, 0xf0, 0xdd, 0xe0, 0xfe,
          0x0f, 0xdc, 0xba, 0xef, 0xbe, 0xad, 0xde, 0x0d, 0xf0, 0xdd, 0xe0,
          0xfe, 0x0f, 0xdc, 0xba,
        ])
      ),
      BigInt("0xbadc0ffee0ddf00ddeadbeefbadc0ffee0ddf00ddeadbeefbeef")
    );
  });
});

describe("Try buffer conversion (big endian)", () => {
  it("0 should equal 0n", () => {
    assertEquals(toBigIntBE(Buffer.from([0])), BigInt("0"));
  });

  it("1 should equal 1n", async () => {
    assertEquals(toBigIntBE(Buffer.from([1])), BigInt("1"));
  });

  it("0xdead should equal 0xdeadn", async () => {
    assertEquals(toBigIntBE(Buffer.from([0xde, 0xad])), BigInt("0xdead"));
  });

  it("0xdeadbeef should equal 0xdeadbeefn", async () => {
    assertEquals(
      toBigIntBE(Buffer.from([0xde, 0xad, 0xbe, 0xef])),
      BigInt("0xdeadbeef")
    );
  });

  it("0xbadc0ffee0 should equal 0xbadc0ffee0n", async () => {
    assertEquals(
      toBigIntBE(Buffer.from([0xba, 0xdc, 0x0f, 0xfe, 0xe0])),
      BigInt("0xbadc0ffee0")
    );
  });

  it("0xbadc0ffee0dd should equal 0xbadc0ffee0ddn", async () => {
    assertEquals(
      toBigIntBE(Buffer.from([0xba, 0xdc, 0x0f, 0xfe, 0xe0, 0xdd])),
      BigInt("0xbadc0ffee0dd")
    );
  });

  it("0xbadc0ffee0ddf0 should equal 0xbadc0ffee0ddf0n", async () => {
    assertEquals(
      toBigIntBE(Buffer.from([0xba, 0xdc, 0x0f, 0xfe, 0xe0, 0xdd, 0xf0])),
      BigInt("0xbadc0ffee0ddf0")
    );
  });

  it("0xbadc0ffee0ddf00d should equal 0xbadc0ffee0ddf00dn", async () => {
    assertEquals(
      toBigIntBE(Buffer.from([0xba, 0xdc, 0x0f, 0xfe, 0xe0, 0xdd, 0xf0, 0x0d])),
      BigInt("0xbadc0ffee0ddf00d")
    );
  });

  it("0xbadc0ffee0ddf00ddeadbeef should equal 0xbadc0ffee0ddf00ddeadbeefn", async () => {
    assertEquals(
      toBigIntBE(Buffer.from("badc0ffee0ddf00ddeadbeef", "hex")),
      BigInt("0xbadc0ffee0ddf00ddeadbeef")
    );
  });

  it("long value should equal long val", async () => {
    assertEquals(
      toBigIntBE(
        Buffer.from(
          "badc0ffee0ddf00ddeadbeefbadc0ffee0ddf00ddeadbeefbadc0ffee0ddf00ddeadbeef",
          "hex"
        )
      ),
      BigInt(
        "0xbadc0ffee0ddf00ddeadbeefbadc0ffee0ddf00ddeadbeefbadc0ffee0ddf00ddeadbeef"
      )
    );
  });

  it("other long value should equal long val", async () => {
    assertEquals(
      toBigIntBE(
        Buffer.from(
          "d7f8974fb5ac78d9ac099b9ad5018bedc2ce0a72dad1827a1709da30580f0544",
          "hex"
        )
      ),
      BigInt(
        "0xd7f8974fb5ac78d9ac099b9ad5018bedc2ce0a72dad1827a1709da30580f0544"
      )
    );
  });
});

describe("Try bigint conversion (little endian)", () => {
  it("0 should equal 0n", () => {
    expect(toBufferLE(BigInt("0"), 8)).toEqual(
      Buffer.from([0, 0, 0, 0, 0, 0, 0, 0])
    );
  });

  it("1 should equal 1n", async () => {
    expect(toBufferLE(BigInt("1"), 8)).toEqual(
      Buffer.from([1, 0, 0, 0, 0, 0, 0, 0])
    );
  });

  it("1 should equal 1n (32 byte)", async () => {
    expect(toBufferLE(BigInt("1"), 32)).toEqual(
      Buffer.from(
        "0100000000000000000000000000000000000000000000000000000000000000",
        "hex"
      )
    );
  });

  it("0xdead should equal 0xdeadn (6 byte)", async () => {
    expect(toBufferLE(BigInt("0xdead"), 6)).toEqual(
      Buffer.from([0xad, 0xde, 0, 0, 0, 0])
    );
  });

  it("0xdeadbeef should equal 0xdeadbeef0000000000n (9 byte)", async () => {
    expect(toBufferLE(BigInt("0xdeadbeef"), 9)).toEqual(
      Buffer.from([0xef, 0xbe, 0xad, 0xde, 0, 0, 0, 0, 0])
    );
  });

  it("0xbadc0ffee0ddf00d should equal 0xbadc0ffee0ddf00dn (8 byte)", async () => {
    expect(toBufferLE(BigInt("0xbadc0ffee0ddf00d"), 8)).toEqual(
      Buffer.from([0x0d, 0xf0, 0xdd, 0xe0, 0xfe, 0x0f, 0xdc, 0xba])
    );
  });

  it("0xbadc0ffee0ddf00ddeadbeef should equal 0xbadc0ffee0ddf00ddeadbeefn", async () => {
    expect(toBufferLE(BigInt("0xbadc0ffee0ddf00ddeadbeef"), 12)).toEqual(
      Buffer.from([
        0xef, 0xbe, 0xad, 0xde, 0x0d, 0xf0, 0xdd, 0xe0, 0xfe, 0x0f, 0xdc, 0xba,
      ])
    );
  });

  it("long value should equal long val", async () => {
    expect(
      toBufferLE(
        BigInt("0xbadc0ffee0ddf00ddeadbeefbadc0ffee0ddf00ddeadbeef"),
        24
      )
    ).toEqual(
      Buffer.from([
        0xef, 0xbe, 0xad, 0xde, 0x0d, 0xf0, 0xdd, 0xe0, 0xfe, 0x0f, 0xdc, 0xba,
        0xef, 0xbe, 0xad, 0xde, 0x0d, 0xf0, 0xdd, 0xe0, 0xfe, 0x0f, 0xdc, 0xba,
      ])
    );
  });
});

describe("Try bigint conversion (big endian)", () => {
  it("0 should equal 0n", () => {
    expect(toBufferBE(BigInt("0"), 8)).toEqual(
      Buffer.from([0, 0, 0, 0, 0, 0, 0, 0])
    );
  });

  it("1 should equal 1n", async () => {
    expect(toBufferBE(BigInt("1"), 8)).toEqual(
      Buffer.from([0, 0, 0, 0, 0, 0, 0, 1])
    );
  });

  it("1 should equal 1n (32 byte)", async () => {
    expect(toBufferBE(BigInt("1"), 32)).toEqual(
      Buffer.from(
        "0000000000000000000000000000000000000000000000000000000000000001",
        "hex"
      )
    );
  });

  it("0xdead should equal 0xdeadn (6 byte)", async () => {
    expect(toBufferBE(BigInt("0xdead"), 6)).toEqual(
      Buffer.from([0, 0, 0, 0, 0xde, 0xad])
    );
  });

  it("0xdeadbeef should equal 0xdeadbeef0000000000n (9 byte)", async () => {
    expect(toBufferBE(BigInt("0xdeadbeef"), 9)).toEqual(
      Buffer.from([0, 0, 0, 0, 0, 0xde, 0xad, 0xbe, 0xef])
    );
  });

  it("0xbadc0ffee0ddf00d should equal 0xbadc0ffee0ddf00dn (8 byte)", async () => {
    expect(toBufferBE(BigInt("0xbadc0ffee0ddf00d"), 8)).toEqual(
      Buffer.from([0xba, 0xdc, 0x0f, 0xfe, 0xe0, 0xdd, 0xf0, 0x0d])
    );
  });

  it("0xbadc0ffee0ddf00ddeadbeef should equal 0xbadc0ffee0ddf00ddeadbeefn", async () => {
    expect(toBufferBE(BigInt("0xbadc0ffee0ddf00ddeadbeef"), 12)).toEqual(
      Buffer.from([
        0xba, 0xdc, 0x0f, 0xfe, 0xe0, 0xdd, 0xf0, 0x0d, 0xde, 0xad, 0xbe, 0xef,
      ])
    );
  });

  it("long value should equal long val", async () => {
    expect(
      toBufferBE(
        BigInt("0xbadc0ffee0ddf00ddeadbeefbadc0ffee0ddf00ddeadbeef"),
        24
      )
    ).toEqual(
      Buffer.from([
        0xba, 0xdc, 0x0f, 0xfe, 0xe0, 0xdd, 0xf0, 0x0d, 0xde, 0xad, 0xbe, 0xef,
        0xba, 0xdc, 0x0f, 0xfe, 0xe0, 0xdd, 0xf0, 0x0d, 0xde, 0xad, 0xbe, 0xef,
      ])
    );
  });
});
