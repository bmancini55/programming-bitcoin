import { Point } from "./Point";
import { S256Field } from "./S256Field";
import { mod, pow } from "../util/BigIntMath";
import { Signature } from "./Signature";
import { bigToBuf, bigFromBuf } from "../util/BigIntUtil";
import { hash160 } from "../util/Hash160";
import { encodeBase58Check } from "../util/Base58";
import { combine } from "../util/BufferUtil";

/**
 * Defines a point on the secp256k1 curve by specifying the a and b values.
 * This allows us to initialize a point on the secp256k1 curve easily without
 * needing to specify a and b every time. It also restricts values to the
 * field defined in secp256k1.
 *
 * This class also specifies the order N, and restricts scalar multiplication
 * to the order N.
 */
export class S256Point extends Point<S256Field> {
  /**
   * `a` value defined for secp256k1 for equation `y**2 = x**3 + ax + b`
   */
  public static a = 0n;

  /**
   * `b` value defined for secp256k1 for equation `y**2 = x**3 + ax + b`
   */
  public static b = 7n;

  /**
   * `N` defines the order used by secp256k1
   */
  public static N = BigInt("0xfffffffffffffffffffffffffffffffebaaedce6af48a03bbfd25e8cd0364141"); // prettier-ignore

  /**
   * Generator point for secp256k1
   */
  public static G = new S256Point(
    BigInt("0x79be667ef9dcbbac55a06295ce870b07029bfcdb2dce28d959f2815b16f81798"),
    BigInt("0x483ada7726a3c4655da4fbfc0e1108a8fd17b448a68554199c47d08ffb10d4b8"),
  ); // prettier-ignore

  /**
   * Infinity value
   */
  // tslint:disable-next-line: variable-name
  public static Infinity = new S256Point(undefined, undefined);

  /**
   * Parses an SEC public key from either uncompressed format or compressed format
   * @param buf
   */
  public static parse(buf: Buffer): S256Point {
    // uncompressed point
    if (buf[0] === 0x04) {
      const x = bigFromBuf(buf.slice(1, 33));
      const y = bigFromBuf(buf.slice(33, 65));
      return new S256Point(x, y);
    }
    // compressed format
    else {
      // x is easy to get
      const x = new S256Field(bigFromBuf(buf.slice(1)));

      // right side of equation y^2 = x^3 +7
      const right = x.pow(3n).add(new S256Field(S256Point.b)); // prettier-ignore

      // solve the left side of the equation, this will result in two values
      // for positive and negative: y and p-y
      const beta = new S256Field(right.num).sqrt();

      let evenBeta: S256Field;
      let oddBeta: S256Field;

      if (beta.num % 2n === 0n) {
        evenBeta = beta;
        oddBeta = new S256Field(S256Field.P - beta.num);
      } else {
        evenBeta = new S256Field(S256Field.P - beta.num);
        oddBeta = beta;
      }

      const isEven = buf[0] === 0x02;
      if (isEven) {
        return new S256Point(x.num, evenBeta.num);
      } else {
        return new S256Point(x.num, oddBeta.num);
      }
    }
  }

  constructor(x: bigint, y: bigint) {
    super(
      x ? new S256Field(x) : undefined,
      y ? new S256Field(y) : undefined,
      new S256Field(S256Point.a),
      new S256Field(S256Point.b)
    );
  }

  /**
   *
   * @param scalar
   */
  public smul(scalar: bigint) {
    scalar = mod(scalar, S256Point.N);
    const point = super.smul(scalar);
    return new S256Point(
      point.x ? point.x.num : undefined,
      point.y ? point.y.num : undefined
    );
  }

  /**
   * Verifies a signature.
   *
   * The verification process is as follows:
   * We are provided (r,s) as the signature and z as the hash
   * of the thing being signed, and P as the public key (public point) of the signer.
   *
   * This calculates:
   *  `u = z/s`
   *  `v = r/s`
   *
   * We then calculate `uG + vP = R`
   * If `R's` `x` coordinate equals `r`, then signature is valid!
   *
   * Implementation notes:
   *  - `s_inv` is calculated using Fermat's Little Theorem to calculate `1/s` since `n` is prime.
   *  - `uG + vP = (r,y)` but we only care about r.
   *
   * @param z hash of information that was signed
   * @param sig signature r,s
   */
  public verify(z: bigint, sig: Signature): boolean {
    const sinv = pow(sig.s, S256Point.N - 2n, S256Point.N);
    const u = mod(z * sinv, S256Point.N);
    const v = mod(sig.r * sinv, S256Point.N);
    const total = S256Point.G.smul(u).add(this.smul(v));
    return sig.r === total.x.num;
  }

  /**
   * Encodes the point as SEC (Standards for Efficiency Cryptography) point.
   * All values are encoded as big-endiant.
   *
   * Uncompressed format:
   * ```
   * 0x04 + x + y
   * ```
   *
   * Compressed format:
   * ```
   * 0x02 + x => when y is even
   * 0x03 + x => when y is odd
   * ```
   */
  public sec(compressed: boolean = false): Buffer {
    if (compressed) {
      const prefix = this.y.num % 2n === 0n ? 2 : 3;
      return Buffer.concat([
          Buffer.from([prefix]),
          bigToBuf(this.x.num)
        ]); // prettier-ignore
    } else {
      return Buffer.concat([
        Buffer.from([0x04]),
        bigToBuf(this.x.num),
        bigToBuf(this.y.num),
      ]);
    }
  }

  /**
   * Performs the hash160 of the SEC encoded point. The SEC
   * point can be either compressed or uncompressed.
   * @param compressed default is true
   */
  public hash160(compressed: boolean = true): Buffer {
    return hash160(this.sec(compressed));
  }

  /**
   * Generates the base58 hash160 bitcoin address. The address can be
   * either compressed or uncompressed and can be for testnet or mainnet.
   *
   * Testnet uses a prefix of 0x6f
   * Mainnet uses a prefix of 0x00
   *
   * @param compressed default is true
   * @param testnet default is false
   */
  public address(compressed: boolean = true, testnet: boolean = false) {
    const prefix = Buffer.from([testnet ? 0x6f : 0x00]);
    const h160 = this.hash160(compressed);
    return encodeBase58Check(combine(prefix, h160));
  }
}
