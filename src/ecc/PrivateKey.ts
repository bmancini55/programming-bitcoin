import { S256Point } from "./S256Point";
import { pow, mod } from "../util/BigIntMath";
import { Signature } from "./Signature";
import * as bigint from "../util/BigIntUtil";
import crypto from "crypto";
import { toBuffer } from "../util/BigIntUtil";
import { encodeBase58, encodeBase58Check } from "../util/Base58";
import { combine } from "../util/BufferUtil";

export class PrivateKey {
  public point: S256Point;

  constructor(readonly secret: bigint) {
    this.point = S256Point.G.smul(secret);
  }

  public toString() {
    return `${this.secret.toString(16).padStart(64, "0")}`;
  }

  /**
   * Signs
   * @param z
   * @param k
   */
  public sign(z: bigint): Signature {
    const k = this.genK(z);
    const r = S256Point.G.smul(k).x.num;
    const kinv = pow(k, S256Point.N - 2n, S256Point.N);
    let s = mod((z + r * this.secret) * kinv, S256Point.N);
    if (s > S256Point.N / 2n) {
      s = S256Point.N - s;
    }
    return new Signature(r, s);
  }

  /**
   * Deterministic k generation using RFC 6979. This method uses
   * the secret z to create a unique, deterministic k every time.
   * @param z
   */
  public genK(z: bigint): bigint {
    let k = Buffer.alloc(32, 0x00);
    let v = Buffer.alloc(32, 0x01);

    if (z > S256Point.N) {
      z -= S256Point.N;
    }

    const zbytes = bigint.toBuffer(z);
    const sbytes = bigint.toBuffer(this.secret);

    const h = "sha256";

    k = crypto
      .createHmac(h, k)
      .update(Buffer.concat([v, Buffer.from([0]), sbytes, zbytes]))
      .digest();
    v = crypto.createHmac(h, k).update(v).digest();
    k = crypto
      .createHmac(h, k)
      .update(Buffer.concat([v, Buffer.from([1]), sbytes, zbytes]))
      .digest();
    v = crypto.createHmac(h, k).update(v).digest();

    while (true) {
      v = crypto.createHmac(h, k).update(v).digest();
      const candidate = bigint.fromBuffer(v);
      if (candidate >= 1n && candidate < S256Point.N) {
        return candidate;
      }

      k = crypto
        .createHmac(h, k)
        .update(Buffer.concat([v, Buffer.from([0])]))
        .digest();
      v = crypto.createHmac(h, k).update(v).digest();
    }
  }

  /**
   * Encodes a private key using the WIF format. Can encode with compressed
   * or uncompressed format and can be for testnet or mainnet.
   *
   * Mainnet prefix: 0x80
   * Testnet prefix: 0xef
   *
   * Algorithm for WIF is:
   * 1. Start with the prefix
   * 2. Encode the secret in 32-byte big-endian format
   * 3. If the SEC format used for the public key address was compressed add
   *    a suffix of 0x01
   * 4. Combine wthe prefix from #1, serialized secret from #2, and suffix from #3
   * 5. Do hash256 of the result from #4 and get the first 4 bytes
   * 6. Take the combination of #4 and #5 and encode it with Base58
   *
   * Note that steps 5 and 6 can be comined with the use of `encodeBase58Check`.
   *
   * @param compressed default of true
   * @param testnet default of false
   */
  public wif(compressed: boolean = true, testnet: boolean = false) {
    // 1. prefix
    const prefix = Buffer.from([testnet ? 0xef : 0x80]);

    // 2. encode as 32-byte big-endian number
    const secret = toBuffer(this.secret, 32);

    // 3. suffix
    const suffix = compressed ? Buffer.from([0x01]) : Buffer.alloc(0);

    // 4. combine 1, 2, and 3
    return encodeBase58Check(combine(prefix, secret, suffix));
  }
}
