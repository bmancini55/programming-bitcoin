import { fromBuffer } from "./BigIntUtil";
import { divmod } from "./BigIntMath";

export const base58Alphabet =
  "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";

export function encodeBase58(buf: Buffer) {
  // count the leading zero bytes at the front
  let prefix = "";
  for (let i = 0; i < buf.length; i++) {
    if (buf[i] === 0) prefix += "1";
    else break;
  }

  // determine what base58 digit to use
  let num = fromBuffer(buf);
  let result = "";
  while (num > 0n) {
    const [n, mod] = divmod(num, 58n);
    result = base58Alphabet[Number(mod)] + result;
    num = n;
  }

  // prepend all the prefixed 0's
  return prefix + result;
}
