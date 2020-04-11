import { expect } from "chai";
import * as util from "../../src/util/BigIntMath";

describe("mod", () => {
  it("should perform modulus for positive integer", () => {
    expect(util.mod(12n, 5n)).to.equal(2n);
  });

  it("should perform modulus for negative integer", () => {
    expect(util.mod(-12n, 5n)).to.equal(3n);
  });
});
