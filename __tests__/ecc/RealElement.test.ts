import { expect } from "chai";
import { RealElement } from "../../src/ecc/RealElement";

describe("RealElement", () => {
  describe(".eq()", () => {
    it("should return true", () => {
      const a = new RealElement(1n);
      const b = new RealElement(1n);
      expect(a.eq(b)).to.equal(true);
    });

    it("should return false", () => {
      const a = new RealElement(1n);
      const b = new RealElement(2n);
      expect(a.eq(b)).to.equal(false);
    });
  });

  describe(".neq()", () => {
    it("should return true for undefined", () => {
      const a = new RealElement(7n);
      const b = undefined;
      expect(a.neq(b)).to.equal(true);
    });

    it("should return false for equal", () => {
      const a = new RealElement(7n);
      const b = new RealElement(7n);
      expect(a.neq(b)).to.equal(false);
    });

    it("should return true for different value", () => {
      const a = new RealElement(7n);
      const b = new RealElement(8n);
      expect(a.neq(b)).to.equal(true);
    });
  });

  describe(".add()", () => {
    it("should add", () => {
      const a = new RealElement(7n);
      const b = new RealElement(6n);
      expect(a.add(b)).to.deep.equal(new RealElement(13n));
    });
  });

  describe(".sub()", () => {
    it("should sub", () => {
      const a = new RealElement(7n);
      const b = new RealElement(8n);
      expect(a.sub(b)).to.deep.equal(new RealElement(-1n));
    });
  });

  describe(".mul()", () => {
    it("should multiply", () => {
      const a = new RealElement(7n);
      const b = new RealElement(3n);
      expect(a.mul(b)).to.deep.equal(new RealElement(21n));
    });
  });

  describe(".div()", () => {
    it("should divide", () => {
      const a = new RealElement(18n);
      const b = new RealElement(9n);
      expect(a.div(b)).to.deep.equal(new RealElement(2n));
    });
  });

  describe(".pow()", () => {
    it("should exponentiate", () => {
      const a = new RealElement(2n);
      const e = 2n;
      expect(a.pow(e)).to.deep.equal(new RealElement(4n));
    });
  });

  describe(".smul()", () => {
    it("should multiply by zero", () => {
      const a = new RealElement(7n);
      const b = 0n;
      expect(a.smul(b)).to.deep.equal(new RealElement(0n));
    });

    it("should multiply scalar", () => {
      const a = new RealElement(7n);
      const b = 3n;
      expect(a.smul(b)).to.deep.equal(new RealElement(21n));
    });
  });
});
