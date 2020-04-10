import { IOperable } from "./Operable";

/**
 * This is a wrapper class for standard lib's `BigInt` type that conforms
 * to the IOperable type to be used in other math based classes.
 */
export class RealElement implements IOperable<RealElement> {
  constructor(readonly value: bigint) {}

  public toString() {
    return `Real_${this.value.toString()}`;
  }

  public eq(other: RealElement): boolean {
    if (!other) return false;
    return this.value === other.value;
  }

  public neq(other: RealElement): boolean {
    return !this.eq(other);
  }

  public add(other: RealElement): RealElement {
    return new RealElement(this.value + other.value);
  }

  public sub(other: RealElement): RealElement {
    return new RealElement(this.value - other.value);
  }

  public mul(other: RealElement): RealElement {
    return new RealElement(this.value * other.value);
  }

  public div(other: RealElement): RealElement {
    return new RealElement(this.value / other.value);
  }

  public pow(exponent: bigint): RealElement {
    return new RealElement(this.value ** exponent);
  }

  public smul(scalar: bigint): RealElement {
    return new RealElement(this.value * scalar);
  }
}
