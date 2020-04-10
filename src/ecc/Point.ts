import { IOperable } from "./Operable";

/**
 * Defines a point on a specific curve. The curve must have the form
 * y^2 = x^3 + ax + b and has the curve defined with two number: a and b.
 */
export class Point<T> {
  /**
   *
   * @param a
   * @param b
   */
  public static infinity<T>(a: IOperable<T>, b: IOperable<T>) {
    return new Point(undefined, undefined, a, b);
  }

  constructor(
    readonly x: IOperable<T>,
    readonly y: IOperable<T>,
    readonly a: IOperable<T>,
    readonly b: IOperable<T>
  ) {
    if (x === undefined && y === undefined) {
      return;
    }
    // y ** 2 !== x ** 3 + a * x + b
    if (y.pow(2n).neq(x.pow(3n).add(a.mul(x)).add(b))) {
      throw new Error(`(${x}, ${y}) is not on the curve`);
    }
  }

  /**
   * Returns true when the values (x, y, a, b) of this point match the values
   * of the other point.
   * @param other
   */
  public eq(other: Point<T>): boolean {
    if (!other) return false;
    return (
      ((this.x && this.x.eq(other.x)) || (!this.x && !other.x)) &&
      ((this.y && this.y.eq(other.y)) || (!this.y && !other.y)) &&
      this.a.eq(other.a) &&
      this.b.eq(other.b)
    );
  }

  /**
   * Returns true when the values (x, y, a, b) of this point do not match
   * the other point
   * @param other
   */
  public neq(other: Point<T>): boolean {
    return !this.eq(other);
  }

  /**
   * Returns true when the x and y values supplied are on the curve
   * @param x
   * @param y
   */
  public onCurve(x: IOperable<T>, y: IOperable<T>): boolean {
    // y ** 2n === x ** 3n + this.a * x + this.b
    return y.pow(2n).eq(x.pow(3n).add(this.a.mul(x).add(this.b)));
  }

  /**
   * Perform point addition
   * @param other
   */
  public add(other: Point<T>): Point<T> {
    if (this.a.neq(other.a) || this.b.neq(other.b)) {
      throw new Error(`Points ${this} and ${other} are not on same curve`);
    }

    // handle me as identity point
    if (this.x === undefined) return other;

    // handle other as identity point
    if (other.x === undefined) return this;

    // handle additive inverse, same x but different y
    if (this.x.eq(other.x) && this.y.neq(other.y)) {
      return Point.infinity(this.a, this.b);
    }

    // handle when this.x !== other.x
    if (this.x.neq(other.x)) {
      const s = other.y.sub(this.y).div(other.x.sub(this.x));
      const x = s.pow(2n).sub(this.x).sub(other.x);
      const y = s.mul(this.x.sub(x)).sub(this.y);
      return new Point(x, y, this.a, this.b);
    }

    // handle when tangent line is vertical
    if (this.eq(other) && this.y.eq(this.x.smul(0n))) {
      return Point.infinity(this.a, this.b);
    }

    // handle when p1 = p2
    if (this.eq(other)) {
      const s = this.x.pow(2n).smul(3n).add(this.a).div(this.y.smul(2n));
      const x = s.pow(2n).sub(this.x.smul(2n));
      const y = s.mul(this.x.sub(x)).sub(this.y);
      return new Point(x, y, this.a, this.b);
    }
  }

  /**
   * Scalar multiply a point using binary expansion
   * @param scalar
   */
  public smul(scalar: bigint): Point<T> {
    let current: Point<T> = this;
    let result = new Point<T>(undefined, undefined, this.a, this.b);
    while (scalar) {
      if (scalar & 1n) {
        result = result.add(current);
      }
      current = current.add(current);
      scalar = scalar >> 1n;
    }
    return result;
  }
}
