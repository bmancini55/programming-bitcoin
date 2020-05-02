import { expect } from "chai";
import { BloomFilter } from "../src/BloomFilter";
import { bigToBufLE } from "../src/util/BigIntUtil";
describe("BloomFilter", () => {
  describe(".add()", () => {
    it("test 1", () => {
      const bf = new BloomFilter(2n, 2n, 42n);
      bf.add(Buffer.from("hello world"));
      bf.add(Buffer.from("goodbye"));
      expect(bf.bitArray.join("")).to.equal("0000011001100000");
    });

    it("test 2", () => {
      const bf = new BloomFilter(10n, 5n, 99n);
      bf.add(Buffer.from("Hello World"));
      bf.add(Buffer.from("Goodbye!"));
      expect(bf.bytes.toString("hex")).to.equal("4000600a080000010940");
    });
  });
});
