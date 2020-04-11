import { Point } from "./Point";
import { S256Field } from "./S256Field";
import { mod, pow } from "../util/BigIntMath";
import { Signature } from "./Signature";

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
}
