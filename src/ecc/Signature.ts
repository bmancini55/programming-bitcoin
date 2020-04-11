import { S256Field } from "./S256Field";

/**
 * Signature for secp256k1 that houses the `r` and `s` points.
 */
export class Signature {
  constructor(readonly r: bigint, readonly s: bigint) {}

  public toString() {
    return `Signature_${this.r}_${this.s}`;
  }
}
