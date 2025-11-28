import { describe, it, expect, should, beforeAll } from "vitest";

let lib: Awaited<typeof import("./index.js")>;
let toBigIntBE: any;
let toBigIntLE: any;
let toBufferBE: any;
let toBufferLE: any;
let bigintToBuf: any;
let bufToBigint: any;
let bigintToHex: any;
let hexToBigint: any;
let bigintToText: any;
let textToBigint: any;
let bigintToBase64: any;
let base64ToBigint: any;

beforeAll(async () => {
  lib = await import("./index.js");
  toBigIntBE = lib.toBigIntBE;
  toBigIntLE = lib.toBigIntLE;
  toBufferBE = lib.toBufferBE;
  toBufferLE = lib.toBufferLE;
  bigintToBuf = lib.bigintToBuf;
  bufToBigint = lib.bufToBigint;
  bigintToHex = lib.bigintToHex;
  hexToBigint = lib.hexToBigint;
  bigintToText = lib.bigintToText;
  textToBigint = lib.textToBigint;
  bigintToBase64 = lib.bigintToBase64;
  base64ToBigint = lib.base64ToBigint;
});

// Needed for should.not.be.undefined.
/* tslint:disable:no-unused-expression */

should();

const assertEquals = (n0: bigint, n1: bigint) => {
  expect(n0.toString(16)).to.be.equal(n1.toString(16));
};

describe("Try buffer conversion (little endian)", () => {
  it("0 should equal 0n", () => {
    assertEquals(toBigIntLE(Buffer.from([0])), BigInt("0"));
  });

  it("1 should equal 1n", async () => {
    assertEquals(toBigIntLE(Buffer.from([1])), BigInt("1"));
  });

  it("0xdead should equal 0xdeadn", async () => {
    assertEquals(toBigIntLE(Buffer.from([0xad, 0xde])), BigInt(`0xdead`));
  });

  it("0xdeadbeef should equal 0xdeadbeefn", async () => {
    assertEquals(
      toBigIntLE(Buffer.from([0xef, 0xbe, 0xad, 0xde])),
      BigInt(`0xdeadbeef`)
    );
  });

  it("0xbadc0ffee0 should equal 0xbadc0ffee0n", async () => {
    assertEquals(
      toBigIntLE(Buffer.from([0xe0, 0xfe, 0x0f, 0xdc, 0xba])),
      BigInt(`0xbadc0ffee0`)
    );
  });

  it("0xbadc0ffee0dd should equal 0xbadc0ffee0ddn", async () => {
    assertEquals(
      toBigIntLE(Buffer.from([0xdd, 0xe0, 0xfe, 0x0f, 0xdc, 0xba])),
      BigInt(`0xbadc0ffee0dd`)
    );
  });

  it("0xbadc0ffee0ddf0 should equal 0xbadc0ffee0ddf0n", async () => {
    assertEquals(
      toBigIntLE(Buffer.from([0xf0, 0xdd, 0xe0, 0xfe, 0x0f, 0xdc, 0xba])),
      BigInt(`0xbadc0ffee0ddf0`)
    );
  });

  it("0xbadc0ffee0ddf00d should equal 0xbadc0ffee0ddf00dn", async () => {
    assertEquals(
      toBigIntLE(Buffer.from([0x0d, 0xf0, 0xdd, 0xe0, 0xfe, 0x0f, 0xdc, 0xba])),
      BigInt(`0xbadc0ffee0ddf00d`)
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
      BigInt(`0xbadc0ffee0ddf00ddeadbeef`)
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
      BigInt(`0xbadc0ffee0ddf00ddeadbeefbadc0ffee0ddf00ddeadbeef`)
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
      BigInt(`0xbadc0ffee0ddf00ddeadbeefbadc0ffee0ddf00ddeadbeefbeef`)
    );
  });
});

describe("Try buffer conversion (big endian)", () => {
  it("0 should equal 0n", () => {
    assertEquals(toBigIntBE(Buffer.from([0])), BigInt(`0`));
  });

  it("1 should equal 1n", async () => {
    assertEquals(toBigIntBE(Buffer.from([1])), BigInt(`1`));
  });

  it("0xdead should equal 0xdeadn", async () => {
    assertEquals(toBigIntBE(Buffer.from([0xde, 0xad])), BigInt(`0xdead`));
  });

  it("0xdeadbeef should equal 0xdeadbeefn", async () => {
    assertEquals(
      toBigIntBE(Buffer.from([0xde, 0xad, 0xbe, 0xef])),
      BigInt(`0xdeadbeef`)
    );
  });

  it("0xbadc0ffee0 should equal 0xbadc0ffee0n", async () => {
    assertEquals(
      toBigIntBE(Buffer.from([0xba, 0xdc, 0x0f, 0xfe, 0xe0])),
      BigInt(`0xbadc0ffee0`)
    );
  });

  it("0xbadc0ffee0dd should equal 0xbadc0ffee0ddn", async () => {
    assertEquals(
      toBigIntBE(Buffer.from([0xba, 0xdc, 0x0f, 0xfe, 0xe0, 0xdd])),
      BigInt(`0xbadc0ffee0dd`)
    );
  });

  it("0xbadc0ffee0ddf0 should equal 0xbadc0ffee0ddf0n", async () => {
    assertEquals(
      toBigIntBE(Buffer.from([0xba, 0xdc, 0x0f, 0xfe, 0xe0, 0xdd, 0xf0])),
      BigInt(`0xbadc0ffee0ddf0`)
    );
  });

  it("0xbadc0ffee0ddf00d should equal 0xbadc0ffee0ddf00dn", async () => {
    assertEquals(
      toBigIntBE(Buffer.from([0xba, 0xdc, 0x0f, 0xfe, 0xe0, 0xdd, 0xf0, 0x0d])),
      BigInt(`0xbadc0ffee0ddf00d`)
    );
  });

  it("0xbadc0ffee0ddf00ddeadbeef should equal 0xbadc0ffee0ddf00ddeadbeefn", async () => {
    assertEquals(
      toBigIntBE(
        Buffer.from([
          0xba, 0xdc, 0x0f, 0xfe, 0xe0, 0xdd, 0xf0, 0x0d, 0xde, 0xad, 0xbe,
          0xef,
        ])
      ),
      BigInt(`0xbadc0ffee0ddf00ddeadbeef`)
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
        `0xbadc0ffee0ddf00ddeadbeefbadc0ffee0ddf00ddeadbeefbadc0ffee0ddf00ddeadbeef`
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
        `0xd7f8974fb5ac78d9ac099b9ad5018bedc2ce0a72dad1827a1709da30580f0544`
      )
    );
  });
});

describe("Try bigint conversion (little endian)", () => {
  it("0 should equal 0n", () => {
    toBufferLE(BigInt(`0`), 8).should.deep.equal(
      Buffer.from([0, 0, 0, 0, 0, 0, 0, 0])
    );
  });

  it("1 should equal 1n", async () => {
    toBufferLE(BigInt(`1`), 8).should.deep.equal(
      Buffer.from([1, 0, 0, 0, 0, 0, 0, 0])
    );
  });

  it("1 should equal 1n (32 byte)", async () => {
    toBufferLE(BigInt(`1`), 32).should.deep.equal(
      Buffer.from(
        "0100000000000000000000000000000000000000000000000000000000000000",
        "hex"
      )
    );
  });

  it("0xdead should equal 0xdeadn (6 byte)", async () => {
    toBufferLE(BigInt(`0xdead`), 6).should.deep.equal(
      Buffer.from([0xad, 0xde, 0, 0, 0, 0])
    );
  });

  it("0xdeadbeef should equal 0xdeadbeef0000000000n (9 byte)", async () => {
    toBufferLE(BigInt(`0xdeadbeef`), 9).should.deep.equal(
      Buffer.from([0xef, 0xbe, 0xad, 0xde, 0, 0, 0, 0, 0])
    );
  });

  it("0xbadc0ffee0ddf00d should equal 0xbadc0ffee0ddf00dn (8 byte)", async () => {
    toBufferLE(BigInt(`0xbadc0ffee0ddf00d`), 8).should.deep.equal(
      Buffer.from([0x0d, 0xf0, 0xdd, 0xe0, 0xfe, 0x0f, 0xdc, 0xba])
    );
  });

  it("0xbadc0ffee0ddf00ddeadbeef should equal 0xbadc0ffee0ddf00ddeadbeefn", async () => {
    toBufferLE(BigInt(`0xbadc0ffee0ddf00ddeadbeef`), 12).should.deep.equal(
      Buffer.from([
        0xef, 0xbe, 0xad, 0xde, 0x0d, 0xf0, 0xdd, 0xe0, 0xfe, 0x0f, 0xdc, 0xba,
      ])
    );
  });

  it("long value should equal long val", async () => {
    toBufferLE(
      BigInt(`0xbadc0ffee0ddf00ddeadbeefbadc0ffee0ddf00ddeadbeef`),
      24
    ).should.deep.equal(
      Buffer.from([
        0xef, 0xbe, 0xad, 0xde, 0x0d, 0xf0, 0xdd, 0xe0, 0xfe, 0x0f, 0xdc, 0xba,
        0xef, 0xbe, 0xad, 0xde, 0x0d, 0xf0, 0xdd, 0xe0, 0xfe, 0x0f, 0xdc, 0xba,
      ])
    );
  });
});

describe("Try bigint conversion (big endian)", () => {
  it("0 should equal 0n", () => {
    toBufferBE(BigInt(`0`), 8).should.deep.equal(
      Buffer.from([0, 0, 0, 0, 0, 0, 0, 0])
    );
  });

  it("1 should equal 1n", async () => {
    toBufferBE(BigInt(`1`), 8).should.deep.equal(
      Buffer.from([0, 0, 0, 0, 0, 0, 0, 1])
    );
  });

  it("1 should equal 1n (32 byte)", async () => {
    toBufferBE(BigInt(`1`), 32).should.deep.equal(
      Buffer.from(
        "0000000000000000000000000000000000000000000000000000000000000001",
        "hex"
      )
    );
  });

  it("0xdead should equal 0xdeadn (6 byte)", async () => {
    toBufferBE(BigInt(`0xdead`), 6).should.deep.equal(
      Buffer.from([0, 0, 0, 0, 0xde, 0xad])
    );
  });

  it("0xdeadbeef should equal 0xdeadbeef0000000000n (9 byte)", async () => {
    toBufferBE(BigInt(`0xdeadbeef`), 9).should.deep.equal(
      Buffer.from([0, 0, 0, 0, 0, 0xde, 0xad, 0xbe, 0xef])
    );
  });

  it("0xbadc0ffee0ddf00d should equal 0xbadc0ffee0ddf00dn (8 byte)", async () => {
    toBufferBE(BigInt(`0xbadc0ffee0ddf00d`), 8).should.deep.equal(
      Buffer.from([0xba, 0xdc, 0x0f, 0xfe, 0xe0, 0xdd, 0xf0, 0x0d])
    );
  });

  it("0xbadc0ffee0ddf00ddeadbeef should equal 0xbadc0ffee0ddf00ddeadbeefn", async () => {
    toBufferBE(BigInt(`0xbadc0ffee0ddf00ddeadbeef`), 12).should.deep.equal(
      Buffer.from([
        0xba, 0xdc, 0x0f, 0xfe, 0xe0, 0xdd, 0xf0, 0x0d, 0xde, 0xad, 0xbe, 0xef,
      ])
    );
  });

  it("long value should equal long val", async () => {
    toBufferBE(
      BigInt(`0xbadc0ffee0ddf00ddeadbeefbadc0ffee0ddf00ddeadbeef`),
      24
    ).should.deep.equal(
      Buffer.from([
        0xba, 0xdc, 0x0f, 0xfe, 0xe0, 0xdd, 0xf0, 0x0d, 0xde, 0xad, 0xbe, 0xef,
        0xba, 0xdc, 0x0f, 0xfe, 0xe0, 0xdd, 0xf0, 0x0d, 0xde, 0xad, 0xbe, 0xef,
      ])
    );
  });
});

describe("Conversion Utilities - bigintToBuf and bufToBigint", () => {
  it("should convert 0 to buffer", () => {
    const buf = bigintToBuf(BigInt(0));
    expect(buf).to.deep.equal(Buffer.from([0]));
  });

  it("should convert small number to buffer", () => {
    const buf = bigintToBuf(BigInt(123456789));
    assertEquals(bufToBigint(buf), BigInt(123456789));
  });

  it("should round-trip convert medium numbers", () => {
    const original = BigInt("0xdeadbeef");
    const buf = bigintToBuf(original);
    const result = bufToBigint(buf);
    assertEquals(result, original);
  });

  it("should round-trip convert large numbers", () => {
    const original = BigInt("0xbadc0ffee0ddf00ddeadbeef");
    const buf = bigintToBuf(original);
    const result = bufToBigint(buf);
    assertEquals(result, original);
  });

  it("should throw error for negative bigint", () => {
    expect(() => bigintToBuf(BigInt(-1))).to.throw();
  });
});

describe("Conversion Utilities - bigintToHex and hexToBigint", () => {
  it("should convert 0 to hex", () => {
    expect(bigintToHex(BigInt(0))).to.equal("00");
  });

  it("should convert small number to hex", () => {
    expect(bigintToHex(BigInt(255))).to.equal("ff");
  });

  it("should convert number to even-length hex", () => {
    expect(bigintToHex(BigInt(15))).to.equal("0f");
  });

  it("should convert hex string to bigint", () => {
    assertEquals(hexToBigint("deadbeef"), BigInt("0xdeadbeef"));
  });

  it("should handle hex string with 0x prefix", () => {
    assertEquals(hexToBigint("0xdeadbeef"), BigInt("0xdeadbeef"));
  });

  it("should round-trip convert", () => {
    const original = BigInt("0xbadc0ffee0ddf00ddeadbeef");
    const hex = bigintToHex(original);
    const result = hexToBigint(hex);
    assertEquals(result, original);
  });

  it("should throw error for empty string", () => {
    expect(() => hexToBigint("")).to.throw();
  });

  it("should throw error for negative bigint", () => {
    expect(() => bigintToHex(BigInt(-1))).to.throw();
  });
});

describe("Conversion Utilities - bigintToText and textToBigint", () => {
  it("should convert 0 to text", () => {
    expect(bigintToText(BigInt(0))).to.equal("0");
  });

  it("should convert positive number to text", () => {
    expect(bigintToText(BigInt(123456789))).to.equal("123456789");
  });

  it("should convert large number to text", () => {
    expect(bigintToText(BigInt("0xdeadbeef"))).to.equal("3735928559");
  });

  it("should convert text to bigint", () => {
    assertEquals(textToBigint("123456789"), BigInt(123456789));
  });

  it("should round-trip convert", () => {
    const original = BigInt("9876543210123456789");
    const text = bigintToText(original);
    const result = textToBigint(text);
    assertEquals(result, original);
  });

  it("should throw error for empty string", () => {
    expect(() => textToBigint("")).to.throw();
  });

  it("should convert arbitrary text to bigint bytes", () => {
    assertEquals(textToBigint("abc"), BigInt("0x616263"));
  });
});

describe("Conversion Utilities - bigintToBase64 and base64ToBigint", () => {
  it("should convert 0 to base64", () => {
    const b64 = bigintToBase64(BigInt(0));
    expect(b64).to.be.a("string");
    assertEquals(base64ToBigint(b64), BigInt(0));
  });

  it("should convert small number to base64", () => {
    const original = BigInt(123456789);
    const b64 = bigintToBase64(original);
    expect(b64).to.equal("B1vNFQ==");
  });

  it("should convert base64 to bigint", () => {
    assertEquals(base64ToBigint("B1vNFQ=="), BigInt(123456789));
  });

  it("should round-trip convert medium numbers", () => {
    const original = BigInt("0xdeadbeef");
    const b64 = bigintToBase64(original);
    const result = base64ToBigint(b64);
    assertEquals(result, original);
  });

  it("should round-trip convert large numbers", () => {
    const original = BigInt("0xbadc0ffee0ddf00ddeadbeef");
    const b64 = bigintToBase64(original);
    const result = base64ToBigint(b64);
    assertEquals(result, original);
  });

  it("should throw error for negative bigint", () => {
    expect(() => bigintToBase64(BigInt(-1))).to.throw();
  });

  it("should handle empty base64 string as zero", () => {
    assertEquals(base64ToBigint(""), BigInt(0));
  });

  it("should throw error for invalid base64 string", () => {
    expect(() => base64ToBigint("invalid!@#")).to.throw();
  });
});
