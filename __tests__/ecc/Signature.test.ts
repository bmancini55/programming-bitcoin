import { expect } from "chai";
import { Signature } from "../../src/ecc/Signature";
import { PrivateKey } from "../../src/ecc/PrivateKey";
import crypto from "crypto";
import { fromBuffer } from "../../src/util/BigIntUtil";

describe("Signature", () => {
  describe("sign", () => {
    it("creates valid sig", () => {
      const r = crypto.randomBytes(32);
      const pk = new PrivateKey(fromBuffer(r));
      const z = fromBuffer(crypto.randomBytes(32));
      const sig = pk.sign(z);
      expect(pk.point.verify(z, sig)).to.equal(true);
    });
  });
});
