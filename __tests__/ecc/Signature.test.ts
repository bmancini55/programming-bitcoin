import { expect } from "chai";
import { Signature } from "../../src/ecc/Signature";
import { PrivateKey } from "../../src/ecc/PrivateKey";
import crypto from "crypto";
import { bigFromBuf } from "../../src/util/BigIntUtil";

describe("Signature", () => {
  describe("sign", () => {
    it("creates valid sig", () => {
      const r = crypto.randomBytes(32);
      const pk = new PrivateKey(bigFromBuf(r));
      const z = bigFromBuf(crypto.randomBytes(32));
      const sig = pk.sign(z);
      expect(pk.point.verify(z, sig)).to.equal(true);
    });
  });

  describe("der()", () => {
    it("encodes", () => {
      const r = BigInt("0x37206a0610995c58074999cb9767b87af4c4978db68c06e8e6e81d282047a7c6"); // prettier-ignore
      const s = BigInt("0x8ca63759c1157ebeaec0d03cecca119fc9a75bf8e6d0fa65c841c8e2738cdaec"); // prettier-ignore
      const sig = new Signature(r, s);
      expect(sig.der().toString("hex")).to.deep.equal(
        "3045022037206a0610995c58074999cb9767b87af4c4978db68c06e8e6e81d282047a7c60221008ca63759c1157ebeaec0d03cecca119fc9a75bf8e6d0fa65c841c8e2738cdaec"
      );
    });
  });
});
