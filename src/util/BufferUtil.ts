import { Readable } from "stream";
import { bigToBufLE } from "./BigIntUtil";

/**
 * Strips the left bytes if they match the provided value
 * @param val byte value
 */
export function lstrip(buf: Buffer, match: number) {
  for (let i = 0; i < buf.length; i++) {
    if (buf[i] !== match) return Buffer.from(buf.slice(i));
  }
  return Buffer.alloc(0);
}

/**
 * Combines buffers together in the provided order
 * @param buf
 */
export function combine(...buf: Buffer[]): Buffer {
  return Buffer.concat(buf);
}

/**
 * Combines numbers, bigints, and Buffers into a single byte stream
 * where numbers are in little-endian format
 * @param vals
 */
export function combineLE(...vals: (number | bigint | Buffer)[]): Buffer {
  const bufs: Buffer[] = [];
  for (const val of vals) {
    if (val instanceof Buffer) {
      bufs.push(val);
    } else {
      bufs.push(bigToBufLE(BigInt(val)));
    }
  }
  return Buffer.concat(bufs);
}

/**
 * Creates a readable stream
 * @param buf
 */
export function bufToStream(buf: Buffer, end: boolean = true): Readable {
  const stream = new Readable();
  stream.push(buf);
  stream.push(null); // end stream
  return stream;
}
