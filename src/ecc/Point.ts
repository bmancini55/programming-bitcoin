/**
 * Defines a point on a specific curve. The curve must have the form
 * y^2 = x^3 + ax + b and has the curve defined with two number: a and b.
 */
export class Point {
  public static infinity(a: bigint, b: bigint) {
    return new Point(undefined, undefined, a, b);
  }

  constructor(
    readonly x: bigint,
    readonly y: bigint,
    readonly a: bigint,
    readonly b: bigint
  ) {
    if (x === undefined && y === undefined) {
      return;
    }
    if (y ** 2n !== x ** 3n + a * x + b) {
      throw new Error(`(${x}, ${y}) is not on the curve`);
    }
  }

  /**
   * Returns true when the values (x, y, a, b) of this point match the values
   * of the other point.
   * @param other
   */
  public equals(other: Point): boolean {
    return (
      this.x === other.x &&
      this.y === other.y &&
      this.a === other.a &&
      this.b === other.b
    );
  }

  /**
   * Returns true when the x and y values supplied are on the curve
   * @param x
   * @param y
   */
  public onCurve(x: bigint, y: bigint): boolean {
    return y ** 2n === x ** 3n + this.a * x + this.b;
  }

  /**
   * Perform point addition
   * @param other
   */
  public add(other: Point) {
    if (this.a !== other.a || this.b !== other.b) {
      throw new Error(`Points ${this} and ${other} are not on same curve`);
    }

    // handle me as identity point
    if (this.x === undefined) return other;

    // handle other as identity point
    if (other.x === undefined) return this;

    // handle additive inverse, same x but different y
    if (this.x === other.x && this.y !== other.y) {
      return Point.infinity(this.a, this.b);
    }

    // handle when this.x !== other.x
    if (this.x !== other.x) {
      const s = (other.y - this.y) / (other.x - this.x);
      const x = s ** 2n - this.x - other.x;
      const y = s * (this.x - x) - this.y;
      return new Point(x, y, this.a, this.b);
    }

    // handle when tangent line is vertical
    if (this.equals(other) && this.y === 0n * this.x) {
      return Point.infinity(this.a, this.b);
    }

    // handle when p1 = p2
    if (this.equals(other)) {
      const s = (3n * this.x ** 2n + this.a) / (2n * this.y);
      const x = s ** 2n - 2n * this.x;
      const y = s * (this.x - x) - this.y;
      return new Point(x, y, this.a, this.b);
    }
  }
}
