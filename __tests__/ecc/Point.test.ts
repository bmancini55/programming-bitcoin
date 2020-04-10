import { expect } from "chai";
import { Point } from "../../src/ecc/Point";

describe("Point", () => {
  describe("constructor", () => {
    it("should throw when point not on curve", () => {
      expect(() => new Point(-1n, -2n, 5n, 7n)).to.throw();
    });
    it("should support infinity", () => {
      const i = Point.infinity(5n, 7n);
      expect(i.x).to.equal(undefined);
      expect(i.y).to.equal(undefined);
    });
  });

  describe(".equals()", () => {
    it("should return true when identical", () => {
      const a = new Point(-1n, -1n, 5n, 7n);
      const b = new Point(-1n, -1n, 5n, 7n);
      expect(a.equals(b)).to.equal(true);
    });

    it("should return false", () => {
      const a = Point.infinity(5n, 7n);
      const b = new Point(-1n, -1n, 5n, 7n);
      expect(a.equals(b)).to.equal(false);
    });
  });

  describe(".onCurve()", () => {
    it("should return false", () => {
      const a = Point.infinity(5n, 7n);
      expect(a.onCurve(2n, 4n)).to.equal(false);
    });

    it("should return true", () => {
      const a = Point.infinity(5n, 7n);
      expect(a.onCurve(18n, 77n)).to.equal(true);
    });
  });

  describe(".add()", () => {
    it("should return other when I am inverse", () => {
      const a = Point.infinity(5n, 7n);
      const b = new Point(-1n, -1n, 5n, 7n);
      expect(a.add(b)).to.deep.equal(b);
    });

    it("should return me when other is inverse", () => {
      const a = new Point(-1n, -1n, 5n, 7n);
      const b = Point.infinity(5n, 7n);
      expect(a.add(b)).to.deep.equal(a);
    });

    it("should return infinity when additive inverse", () => {
      const a = new Point(-1n, -1n, 5n, 7n);
      const b = new Point(-1n, 1n, 5n, 7n);
      expect(a.add(b)).to.deep.equal(Point.infinity(5n, 7n));
    });

    it("when x1 !== x2", () => {
      const a = new Point(-1n, -1n, 5n, 7n);
      const b = new Point(2n, 5n, 5n, 7n);
      expect(a.add(b)).to.deep.equal(new Point(3n, -7n, 5n, 7n));
    });

    it("when p1 === p2", () => {
      const a = new Point(-1n, 1n, 5n, 7n);
      const b = new Point(-1n, 1n, 5n, 7n);
      expect(a.add(b)).to.deep.equal(new Point(18n, -77n, 5n, 7n));
    });

    it("when vertical tangent", () => {
      const a = new Point(-1n, 0n, 6n, 7n);
      const b = new Point(-1n, 0n, 6n, 7n);
      expect(a.add(b)).to.deep.equal(Point.infinity(6n, 7n));
    });
  });
});
