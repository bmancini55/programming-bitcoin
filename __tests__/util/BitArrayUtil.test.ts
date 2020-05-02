import { expect } from "chai";
import { bitArrayToBuf } from "../../src/util/BitArrayUtil";

describe("BitArrayUtil", () => {
  describe(".bitArrayToBuf()", () => {
    it("8 bits", () => {
      const bitArray = [1, 0, 0, 0, 1, 0, 0, 0];
      const result = bitArrayToBuf(bitArray);
      expect(result.toString("hex")).to.equal("11");
    });

    it("16 bits", () => {
      const bitArray = [
        0, 0, 0, 0, 0, 0, 0, 0,
        1, 0, 0, 0, 0, 0, 0, 0,
      ]; // prettier-ignore
      const result = bitArrayToBuf(bitArray);
      expect(result.toString("hex")).to.equal("0001");
    });

    it("80 bits", () => {
      const bitArray = [0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0]; // prettier-ignore
      const result = bitArrayToBuf(bitArray);
      expect(result.toString("hex")).to.equal("4000600a080000010940");
    });
  });
});
