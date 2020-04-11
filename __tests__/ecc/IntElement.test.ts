import { expect } from "chai";
import { IntElement } from "../../src/ecc/IntElement";

describe("IntElement", () => {
  describe(".eq()", () => {
    it("should return true", () => {
      const a = new IntElement(1n);
      const b = new IntElement(1n);
      expect(a.eq(b)).to.equal(true);
    });

    it("should return false", () => {
      const a = new IntElement(1n);
      const b = new IntElement(2n);
      expect(a.eq(b)).to.equal(false);
    });
  });

  describe(".neq()", () => {
    it("should return true for undefined", () => {
      const a = new IntElement(7n);
      const b = undefined;
      expect(a.neq(b)).to.equal(true);
    });

    it("should return false for equal", () => {
      const a = new IntElement(7n);
      const b = new IntElement(7n);
      expect(a.neq(b)).to.equal(false);
    });

    it("should return true for different value", () => {
      const a = new IntElement(7n);
      const b = new IntElement(8n);
      expect(a.neq(b)).to.equal(true);
    });
  });

  describe(".add()", () => {
    it("should add", () => {
      const a = new IntElement(7n);
      const b = new IntElement(6n);
      expect(a.add(b)).to.deep.equal(new IntElement(13n));
    });
  });

  describe(".sub()", () => {
    it("should sub", () => {
      const a = new IntElement(7n);
      const b = new IntElement(8n);
      expect(a.sub(b)).to.deep.equal(new IntElement(-1n));
    });
  });

  describe(".mul()", () => {
    it("should multiply", () => {
      const a = new IntElement(7n);
      const b = new IntElement(3n);
      expect(a.mul(b)).to.deep.equal(new IntElement(21n));
    });
  });

  describe(".div()", () => {
    it("should divide", () => {
      const a = new IntElement(18n);
      const b = new IntElement(9n);
      expect(a.div(b)).to.deep.equal(new IntElement(2n));
    });
  });

  describe(".pow()", () => {
    it("should exponentiate", () => {
      const a = new IntElement(2n);
      const e = 2n;
      expect(a.pow(e)).to.deep.equal(new IntElement(4n));
    });
  });

  describe(".smul()", () => {
    it("should multiply by zero", () => {
      const a = new IntElement(7n);
      const b = 0n;
      expect(a.smul(b)).to.deep.equal(new IntElement(0n));
    });

    it("should multiply scalar", () => {
      const a = new IntElement(7n);
      const b = 3n;
      expect(a.smul(b)).to.deep.equal(new IntElement(21n));
    });
  });
});
