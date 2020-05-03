import { expect } from "chai";
import { BloomFilter } from "../../src/BloomFilter";
import { FilterLoadMessage } from "../../src/network/FilterLoadMessage";
import { decodeAddress } from "../../src/util/Address";
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

    it("serializes address", () => {
      const bf = new BloomFilter(30n, 5n, 90210n);
      const address = "mwJn1YPMq7y5F8J3LkC5Hxg9PHyZ5K4cFv";
      const { hash: h160 } = decodeAddress(address);
      bf.add(h160);
      const msg = new FilterLoadMessage(bf);
      expect(msg.serialize().toString("hex")).to.equal(
        "1e000000000448000000000004000000000200000000000000000000000000050000006260010001"
      );
    });
  });
});
