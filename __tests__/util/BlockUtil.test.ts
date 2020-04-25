import { expect } from "chai";
import { bitsToTarget, targetToBits } from "../../src/util/BlockUtil";

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
});
