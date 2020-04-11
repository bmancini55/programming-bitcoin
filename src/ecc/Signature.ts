import { S256Field } from "./S256Field";
import { bigToBuf } from "../util/BigIntUtil";
import * as bufutil from "../util/BufferUtil";

/**
 * Signature for secp256k1 that houses the `r` and `s` points.
 */
export class Signature {
  constructor(readonly r: bigint, readonly s: bigint) {}

  public toString() {
    return `Signature_${this.r}_${this.s}`;
  }

  /**
   * Encodes the signature using the DER (Distinguished Encoding Rules) for
   * encoding a signature with `r` and `s`.
   *
   * The format is defined as:
   *
   * 1. Start with the 0x30 byte
   * 2. Encode the length of the rest of the signature (usually 0x44 or 0x45) and append
   * 3. Append the marker byte 0x02
   * 4. Encode r as a big-endian integer, but prepend it with the 0x00 byte if r's first
   *    byte >= 0x80. Prepend the resulting length to r. Add this to the result.
   * 5. Append the market byte 0x02
   * 6. Encode s as a big-endian integer, but prepend it with the 0x00 byte if s' first
   *    byte >= 0x80. Prepend the resulting length to s. Add this to the result.
   */
  public der() {
    const encodePart = (v: bigint) => {
      // convert bigint to buffer
      let bytes = bigToBuf(v);

      // remove leading null bytes
      bytes = bufutil.lstrip(bytes, 0x00);

      // if r/s has high byte, prepend a 0x00
      if (bytes[0] & 0x80) {
        bytes = Buffer.concat([Buffer.from([0x00]), bytes]);
      }

      // prepend the marker and length to the r/s
      return Buffer.concat([Buffer.from([2, bytes.length]), bytes]);
    };

    const r = encodePart(this.r);
    const s = encodePart(this.s);

    // return 0x30 + total_len + r + s
    return Buffer.concat([Buffer.from([0x30, r.length + s.length]), r, s]);
  }
}
