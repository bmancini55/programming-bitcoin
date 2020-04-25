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
    it("calculates bits from two blocks", async () => {
      const startBuf = Buffer.from(
        "000000201ecd89664fd205a37566e694269ed76e425803003628ab010000000000000000bfcade29d080d9aae8fd461254b041805ae442749f2a40100440fc0e3d5868e55019345954d80118a1721b2e",

        "hex"
      );
      const startStream = bufToStream(startBuf);
      const start = await Block.parse(startStream); // prettier-ignore

      const endBuf = Buffer.from(
        "00000020fdf740b0e49cf75bb3d5168fb3586f7613dcc5cd89675b0100000000000000002e37b144c0baced07eb7e7b64da916cd3121f2427005551aeb0ec6a6402ac7d7f0e4235954d801187f5da9f5",
        "hex"
      );
      const endStream = bufToStream(endBuf);
      const end = await Block.parse(endStream);

      const bits = calcNewBits(start, end);
      // console.log(bitsToTarget(bits).toString(16).padStart(64, "0"));
      // 0000000000000000007615000000000000000000000000000000000000000000
      expect(bits.toString("hex")).to.equal("17761500");
    });
  });
});
