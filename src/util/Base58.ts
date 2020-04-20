import { bigFromBuf, bigToBuf } from "./BigIntUtil";
import { divmod } from "./BigIntMath";
import { hash256 } from "./Hash256";
import { combine } from "./BufferUtil";

export const base58Alphabet =
  "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";

/**
 * Performs base58 encoding by following this process:
 *
 * 1. Finds the leading zeros an creates 1's that will be
 *    prefixed
 * 2. Converts each value into a base58 character by using
 *    the mod operator on the character.
 * 3. The prefix and results of encoding from the base58 characters
 *    are combined.
 * @param buf
 */
export function encodeBase58(buf: Buffer) {
  // count the leading zero bytes at the front
  let prefix = "";
  for (let i = 0; i < buf.length; i++) {
    if (buf[i] === 0) prefix += "1";
    else break;
  }

  // determine what base58 digit to use
  let num = bigFromBuf(buf);
  let result = "";
  while (num > 0n) {
    const [n, mod] = divmod(num, 58n);
    result = base58Alphabet[Number(mod)] + result;
    num = n;
  }

  // prepend all the prefixed 0's
  return prefix + result;
}

/**
 * Perform a base58 encoding by appends a 4-byte hash256 checksum
 * at the end of the value.
 * @param buf
 */
export function encodeBase58Check(buf: Buffer) {
  return encodeBase58(combine(buf, hash256(buf).slice(0, 4)));
}

/**
 * Decodes a base58 string into its original buffer by constructing
 * a number represented in base58 and converting that number into bytes
 * @param input
 */
export function decodeBase58(input: string): Buffer {
  // determine leading zero bytes which will be prepended
  let prefix = 0;
  for (let i = 0; i < input.length; i++) {
    if (input[i] === "1") prefix += 1;
    else break;
  }

  // process remaining bytes
  let num = 0n;
  for (const char of input) {
    num *= 58n;
    num += BigInt(base58Alphabet.indexOf(char));
  }

  return combine(Buffer.alloc(prefix), bigToBuf(num));
}

/**
 * Decodes a base58 check value value
 * @param buf
 */
export function decodeBase58Check(input: string): Buffer {
  const total = decodeBase58(input);
  const data = total.slice(0, total.length - 4);
  const checksum = total.slice(total.length - 4);
  const hash = hash256(data);
  if (!hash.slice(0, 4).equals(checksum)) {
    throw new Error("invalid checksum");
  }
  return data;
}
