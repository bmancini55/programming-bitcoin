import { expect } from "chai";
import { VersionMessage } from "../../src/network/VersionMessage";

describe("VersionMessage", () => {
  describe(".serialize()", () => {
    it("serializes", () => {
      const msg = new VersionMessage();
      msg.timestamp = 0n;
      msg.nonce = Buffer.alloc(8);
      const result = msg.serialize();
      expect(result.toString("hex")).to.equal(
        "7f11010000000000000000000000000000000000000000000000000000000000000000000000ffff00000000208d000000000000000000000000000000000000ffff00000000208d0000000000000000182f70726f6772616d6d696e67626974636f696e3a302e312f0000000000"
      );
    });
  });
});
