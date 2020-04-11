import { IOperable } from "./Operable";
import { mod } from "../util/BigIntMath";

/**
 * Represents a finite field element which represents an elmement in the field
 * F_prime.
 */
export class FieldElement implements IOperable {
  constructor(readonly num: bigint, readonly prime: bigint) {
    if (num >= prime || num < 0n) {
      throw new Error(`Num ${num} not in field range 0 ${prime - 1n}`);
    }
    this.num = num;
    this.prime = prime;
  }

  public toString() {
    return `FieldElement_${this.prime}(${this.num})`;
  }

  /**
   * Returns true when the other field element is equal to the
   * current field element
   * @param other
   */
  public eq(other: FieldElement): boolean {
    if (!other) return false;
    return this.prime === other.prime && this.num === other.num;
  }

  /**
   * Returns true when the other field element is not equal to the
   * current field element
   * @param other
   */
  public neq(other: FieldElement): boolean {
    return !this.eq(other);
  }

  /**
   * Adds two numbers in the same Field by using the
   * formula: `(a + b) % p`
   */
  public add(other: FieldElement): FieldElement {
    if (this.prime !== other.prime) {
      throw new Error(`Cannot addd two numbers in different Fields`);
    }
    const num = mod(this.num + other.num, this.prime);
    return new FieldElement(num, this.prime);
  }

  /**
   *
   * @remarks
   * This fixes the negative mod bug using the formula:
   *
   * ```
   * (n + p) % p
   * ```
   * @param other
   */
  public sub(other: FieldElement): FieldElement {
    if (this.prime !== other.prime) {
      throw new Error(`Cannot add two numbers in different Fields`);
    }
    const num = mod(this.num - other.num, this.prime);
    return new FieldElement(num, this.prime);
  }

  /**
   * Multiplies two field elements together using the formula:
   *
   * ```
   * (a * b) % p
   * ```
   * @param other
   */
  public mul(other: FieldElement): FieldElement {
    if (this.prime !== other.prime) {
      throw new Error(`Cannot multiply two numbers in different Fields`);
    }
    const num = mod(this.num * other.num, this.prime);
    return new FieldElement(num, this.prime);
  }

  /**
   * Divides one number by another using Fermat's Little Theory which states that
   * 1 = n^(p-1) % p and means we can find the inverse of using the formula
   *
   * ```
   * (a * b ** (p - 2)) % p
   * ```
   * @param other
   */
  public div(other: FieldElement): FieldElement {
    if (this.prime !== other.prime) {
      throw new Error(`Cannot divide two numbers in different Fields`);
    }
    const num = mod(this.num * other.num ** (this.prime - 2n), this.prime);
    return new FieldElement(num, this.prime);
  }

  /**
   * Returns a new FieldElement with the value being the current number
   * raised to the provided exponent. We first force the exponent to be positive
   * using Fermats Little Theorem. This uses the formula:
   *
   * ```
   * b = b % (p - 1)
   * (a ** b) % p
   * ```
   * @param exponent
   */
  public pow(exponent: bigint): FieldElement {
    exponent = (exponent + this.prime - 1n) % (this.prime - 1n); // fixes negative mod bug
    const num = mod(this.num ** exponent, this.prime);
    return new FieldElement(num, this.prime);
  }

  /**
   * Scalar multiple, which is the same as multiplier
   * @param scalar
   */
  public smul(scalar: bigint): FieldElement {
    const num = mod(this.num * scalar, this.prime);
    return new FieldElement(num, this.prime);
  }
}
