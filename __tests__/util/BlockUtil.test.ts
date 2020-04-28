import { expect } from "chai";
import {
  bitsToTarget,
  targetToBits,
  calcNewBits,
} from "../../src/util/BlockUtil";
import { Block } from "../../src/Block";
import { bufToStream } from "../../src/util/BufferUtil";

describe("Block Utilities", () => {
  describe(".targetToBits()", () => {
    it("coefficient < 0x80", () => {
      const bits = Buffer.from("18013ce9", "hex");
      const target = bitsToTarget(bits);
      const back = targetToBits(target);
      expect(back).to.deep.equal(bits);
    });

    it("coefficient > 0x80", () => {
      const bits = Buffer.from("18009645", "hex");
      const target = bitsToTarget(bits);
      const back = targetToBits(target);
      expect(back).to.deep.equal(bits);
    });
  });

  describe(".calcNewBits()", () => {
    it("calculates bits for epoch 2", () => {
      const startBuf = Buffer.from(
        "0100000000000000000000000000000000000000000000000000000000000000000000003ba3edfd7a7b12b27ac72c3e67768f617fc81bc3888a51323a9fb8aa4b1e5e4a29ab5f49ffff001d1dac2b7c",
        "hex"
      );
      const start = Block.parse(bufToStream(startBuf));

      const endBuf = Buffer.from(
        "01000000e25509cde707c3d02a693e4fe9e7cdd57c38a0d2c8d6341f20dae84b000000000c113df1185e162ee92d031fe21d1400ff7d705a3e9b9c860eea855313cd8ca26c087f49ffff001d30b73231",
        "hex"
      );
      const end = Block.parse(bufToStream(endBuf));

      const bits = calcNewBits(end.bits, end.timestamp - start.timestamp);
      expect(bits.toString("hex")).to.equal("1d00ffff");
    });
    it("calculates bits from two blocks", () => {
      const startBuf = Buffer.from(
        "000000201ecd89664fd205a37566e694269ed76e425803003628ab010000000000000000bfcade29d080d9aae8fd461254b041805ae442749f2a40100440fc0e3d5868e55019345954d80118a1721b2e",
        "hex"
      );
      const start = Block.parse(bufToStream(startBuf));

      const endBuf = Buffer.from(
        "00000020fdf740b0e49cf75bb3d5168fb3586f7613dcc5cd89675b0100000000000000002e37b144c0baced07eb7e7b64da916cd3121f2427005551aeb0ec6a6402ac7d7f0e4235954d801187f5da9f5",
        "hex"
      );
      const end = Block.parse(bufToStream(endBuf));

      const bits = calcNewBits(start.bits, end.timestamp - start.timestamp);
      // console.log(bitsToTarget(bits).toString(16).padStart(64, "0"));
      // 0000000000000000007615000000000000000000000000000000000000000000
      expect(bits.toString("hex")).to.equal("17761500");
    });
  });
});
