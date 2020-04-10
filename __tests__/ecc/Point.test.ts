import { expect } from "chai";
import { RealElement } from "../../src/ecc/RealElement";
import { Point } from "../../src/ecc/Point";

const r = (v: bigint) => new RealElement(v);

describe("Point", () => {
  describe("constructor", () => {
    it("should throw when point not on curve", () => {
      expect(() => new Point(r(-1n), r(-2n), r(5n), r(7n))).to.throw();
    });
    it("should support infinity", () => {
      const i = Point.infinity(r(5n), r(7n));
      expect(i.x).to.equal(undefined);
      expect(i.y).to.equal(undefined);
    });
  });

  describe(".eq()", () => {
    it("should return true when identical", () => {
      const a = new Point(r(-1n), r(-1n), r(5n), r(7n));
      const b = new Point(r(-1n), r(-1n), r(5n), r(7n));
      expect(a.eq(b)).to.equal(true);
    });

    it("should return true when both infinity", () => {
      const a = Point.infinity(r(5n), r(7n));
      const b = Point.infinity(r(5n), r(7n));
      expect(a.eq(b)).to.equal(true);
    });

    it("should return false when not other value", () => {
      const a = new Point(r(-1n), r(-1n), r(5n), r(7n));
      const b = undefined;
      expect(a.eq(b)).to.equal(false);
    });

    it("should return false", () => {
      const a = Point.infinity(r(5n), r(7n));
      const b = new Point(r(-1n), r(-1n), r(5n), r(7n));
      expect(a.eq(b)).to.equal(false);
    });

    it("should return false", () => {
      const a = new Point(r(-1n), r(-1n), r(5n), r(7n));
      const b = Point.infinity(r(5n), r(7n));
      expect(a.eq(b)).to.equal(false);
    });
  });

  describe(".onCurve()", () => {
    it("should return false", () => {
      const a = Point.infinity(r(5n), r(7n));
      expect(a.onCurve(r(2n), r(4n))).to.equal(false);
    });

    it("should return true", () => {
      const a = Point.infinity(r(5n), r(7n));
      expect(a.onCurve(r(18n), r(77n))).to.equal(true);
    });
  });

  describe(".add()", () => {
    it("should return other when I am inverse", () => {
      const a = Point.infinity(r(5n), r(7n));
      const b = new Point(r(-1n), r(-1n), r(5n), r(7n));
      expect(a.add(b)).to.deep.equal(b);
    });

    it("should return me when other is inverse", () => {
      const a = new Point(r(-1n), r(-1n), r(5n), r(7n));
      const b = Point.infinity(r(5n), r(7n));
      expect(a.add(b)).to.deep.equal(a);
    });

    it("should return infinity when additive inverse", () => {
      const a = new Point(r(-1n), r(-1n), r(5n), r(7n));
      const b = new Point(r(-1n), r(1n), r(5n), r(7n));
      expect(a.add(b)).to.deep.equal(Point.infinity(r(5n), r(7n)));
    });

    it("when x1 !== x2", () => {
      const a = new Point(r(-1n), r(-1n), r(5n), r(7n));
      const b = new Point(r(2n), r(5n), r(5n), r(7n));
      expect(a.add(b)).to.deep.equal(new Point(r(3n), r(-7n), r(5n), r(7n)));
    });

    it("when p1 === p2", () => {
      const a = new Point(r(-1n), r(1n), r(5n), r(7n));
      const b = new Point(r(-1n), r(1n), r(5n), r(7n));
      expect(a.add(b)).to.deep.equal(new Point(r(18n), r(-77n), r(5n), r(7n)));
    });

    it("when vertical tangent", () => {
      const a = new Point(r(-1n), r(0n), r(6n), r(7n));
      const b = new Point(r(-1n), r(0n), r(6n), r(7n));
      expect(a.add(b)).to.deep.equal(Point.infinity(r(6n), r(7n)));
    });
  });
});
