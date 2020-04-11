import { expect } from "chai";
import { S256Point } from "../../src/ecc/S256Point";
import { Signature } from "../../src/ecc/Signature";

describe("S256Point", () => {
  describe("constructor", () => {
    it("check order of G", () => {
      const g = S256Point.G;
      const n = S256Point.N;
      expect(g.smul(n)).to.deep.equal(S256Point.Infinity);
    });
  });

  describe(".verify()", () => {
    const point = new S256Point(
      BigInt("0x887387e452b8eacc4acfde10d9aaf7f6d9a0f975aabb10d006e4da568744d06c"),
      BigInt("0x61de6d95231cd89026e286df3b6ae4a894a3378e393e93a0f45b666329a0ae34"),
    ); // prettier-ignore

    it("signature 1", () => {
      const z = BigInt("0xec208baa0fc1c19f708a9ca96fdeff3ac3f230bb4a7ba4aede4942ad003c0f60"); // prettier-ignore
      const r = BigInt("0xac8d1c87e51d0d441be8b3dd5b05c8795b48875dffe00b7ffcfac23010d3a395"); // prettier-ignore
      const s = BigInt("0x68342ceff8935ededd102dd876ffd6ba72d6a427a3edb13d26eb0781cb423c4"); // prettier-ignore
      const sig = new Signature(r, s);
      expect(point.verify(z, sig)).to.equal(true);
    });

    it("signature 2", () => {
      const z = BigInt("0x7c076ff316692a3d7eb3c3bb0f8b1488cf72e1afcd929e29307032997a838a3d"); // prettier-ignore
      const r = BigInt("0xeff69ef2b1bd93a66ed5219add4fb51e11a840f404876325a1e8ffe0529a2c"); // prettier-ignore
      const s = BigInt("0xc7207fee197d27c618aea621406f6bf5ef6fca38681d82b2f06fddbdce6feab6"); // prettier-ignore
      const sig = new Signature(r, s);
      expect(point.verify(z, sig)).to.equal(true);
    });
  });
});
