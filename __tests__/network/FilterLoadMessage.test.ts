import { expect } from "chai";
import { BloomFilter } from "../../src/BloomFilter";
import { FilterLoadMessage } from "../../src/network/FilterLoadMessage";
describe("FilterLoadMessage", () => {
  describe(".serialize()", () => {
    it("serializes", () => {
      const bf = new BloomFilter(10n, 5n, 99n);
      bf.add(Buffer.from("Hello World"));
      bf.add(Buffer.from("Goodbye!"));
      const msg = new FilterLoadMessage(bf);
      expect(msg.serialize().toString("hex")).to.equal(
        "0a4000600a080000010940050000006300000001"
      );
    });
  });
});
