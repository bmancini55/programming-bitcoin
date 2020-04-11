import { FieldElement } from "./FieldElement";
import { pow } from "../util/BigIntMath";

/**
 * Defines a subclass of a finite field for use with secp256k1. This
 * allows a simpler method so we do not have to pass in P all the time,
 * it also allows us to strongly type a P256Point which is restricted to
 * values that belong to the P256Field
 */
export class S256Field extends FieldElement {
  /**
   * Prime for secp256k1
   *
   * * ```
   * P = 2**256 - 2**32 - 977
   * ```
   */
  public static P = 2n ** 256n - 2n ** 32n - 977n;

  constructor(num: bigint) {
    super(num, S256Field.P);
  }

  /**
   * Calculate the sqrt of the finite field which is possible because `p % 4 = 3`.
   * The formula for this is:
   *
   * ```
   * v ** ((P + 1) / 4)
   * ```
   */
  public sqrt(): S256Field {
    const r = this.pow((S256Field.P + 1n) / 4n);
    return new S256Field(r.num);
  }
}
