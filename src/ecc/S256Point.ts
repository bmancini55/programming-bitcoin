import { Point } from "./Point";
import { S256Field } from "./S256Field";
import { mod } from "../util/BigIntMath";

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

  public smul(scalar: bigint) {
    scalar = mod(scalar, S256Point.N);
    return super.smul(scalar);
  }
}
