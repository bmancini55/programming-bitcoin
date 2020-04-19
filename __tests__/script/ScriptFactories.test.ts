import { expect } from "chai";
import { hash160 } from "../../src/util/Hash160";
import { p2pkhScript } from "../../src/script/ScriptFactories";

describe("ScriptFactories", () => {
  describe("p2pkhScript", () => {
    it("serializes", () => {
      const h160 = Buffer.from(
        "d52ad7ca9b3d096a38e752c2018e6fbc40cdf26f",
        "hex"
      );
      const result = p2pkhScript(h160);
      expect(result.serialize().toString("hex")).to.equal(
        "1976a914d52ad7ca9b3d096a38e752c2018e6fbc40cdf26f88ac"
      );
    });
  });
});
