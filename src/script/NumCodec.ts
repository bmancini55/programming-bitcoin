/**
 * Encodes a number used in Script
 */
export function encodeNum(num: bigint): Buffer {
  if (num === 0n) {
    return Buffer.alloc(0);
  }

  const bytes = [];
  const neg = num < 0;
  let abs = num > 0 ? num : -num;

  // push each byte starting with the smallest
  while (abs > 0) {
    bytes.push(Number(abs & BigInt(0xff))); // push on smallest byte
    abs >>= 8n; // shift off smallest byte
  }

  // check if the last byte has the 0x80 bit set
  // if so, then we either push a 0 or 0x80
  // if it is postive or negative
  if (bytes[bytes.length - 1] & 0x80) {
    if (neg) {
      bytes.push(0x80);
    } else {
      bytes.push(0);
    }
  }

  // if the number is negative we set the 0x80
  // bit for the number to indicate it is negative
  else {
    if (neg) {
      bytes[bytes.length - 1] |= 0x80;
    }
  }

  // return a buffer of the number
  return Buffer.from(bytes);
}

/**
 * Decodes a number from Script
 */
export function decodeNum(buf: Buffer): bigint {
  if (buf.length === 0) {
    return 0n;
  }

  // convert little-endian number to big-endian
  // which swaps around the bytes that occurred
  // during encoding making the negative flag be
  // in the first byte
  const be = Buffer.from(buf).reverse();

  let neg = false;
  let result = 0n;

  // check if the number is negative, which occurs
  // when the 0x80 bit is set on the first number
  if (be[0] & 0x80) {
    neg = true;
    result = BigInt(be[0]) & BigInt(0x7f); // remove the 0x80 bit
  }

  // not a negative number
  else {
    neg = false;
    result = BigInt(be[0]);
  }

  // read each byte off the buffer
  for (let i = 1; i < be.length; i++) {
    result <<= 8n; // shift right 1-byte
    result += BigInt(be[i]);
  }

  if (neg) {
    return -result;
  } else {
    return result;
  }
}
