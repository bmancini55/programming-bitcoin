import { expect } from "chai";
import { murmur3 } from "../../src/util/MurmurHash";

describe("murmur3", () => {
  const tests: [Buffer, bigint, bigint][] = [
    [Buffer.alloc(0), 0n, 0n],
    [Buffer.alloc(0), 1n, 0x514e28b7n],
    [Buffer.alloc(0), 0xffffffffn, 0x81f16f39n],
    [Buffer.from("ffffffff", "hex"), 0n, 0x76293b50n],
    [Buffer.from("21436587", "hex"), 0n, 0xf55b516bn],
    [Buffer.from("21436587", "hex"), 0x5082edeen, 0x2362f9den],
    [Buffer.from("214365", "hex"), 0n, 0x7e4a8634n],
    [Buffer.from("2143", "hex"), 0n, 0xa0f7b07an],
    [Buffer.from("21", "hex"), 0n, 0x72661cf4n],
    [Buffer.from("00000000", "hex"), 0n, 0x2362f9den],
    [Buffer.from("000000", "hex"), 0n, 0x85f0b427n],
    [Buffer.from("0000", "hex"), 0n, 0x30f4c306n],
    [Buffer.from("00", "hex"), 0n, 0x514e28b7n],
  ];

  for (const test of tests) {
    it(`input: ${test[0].toString("hex")}, seed: ${test[1]}`, () => {
      expect(murmur3(test[0], test[1]).toString()).to.equal(test[2].toString());
    });
  }
});
