import { expect } from "chai";
import { S256Point } from "../../src/ecc/S256Point";

describe("S256Point", () => {
  it("check order of G", () => {
    const g = S256Point.G;
    const n = S256Point.N;
    expect(g.smul(n)).to.deep.equal(S256Point.Infinity);
  });
});
