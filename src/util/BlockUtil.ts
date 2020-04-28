import { Block } from "../Block";
import { bigToBuf } from "./BigIntUtil";
import { lstrip, combine } from "./BufferUtil";

/**
 * Converts the bits as 4-byte big-endian value into the numeric target.
 * Target is calculated as:
 *
 * ```
 * target = coefficient * 256^(exponent-3)
 * ```
 *
 * The target when printed as a 32-byte hex value looks like:
 * 0000000000000000013ce9000000000000000000000000000000000000000000
 *
 */
export function bitsToTarget(bits: Buffer): bigint {
  const exp = BigInt(bits.readUInt8(0));
  const coeff = BigInt(bits.readUIntBE(1, 3));
  return coeff * 256n ** (exp - 3n);
}

/**
 * Converts the numeric target back into bits.
 *
 * @param target
 */
export function targetToBits(target: bigint): Buffer {
  let exponent: Buffer;
  let coefficient: Buffer;

  // convert number to raw bytes
  const rawBytes = bigToBuf(target);

  // the target is always positive, therefore we need to prevent this from
  // being treated as a negative number. If the first bit is a 1 (>=0x80),
  // push a 0x00 as the first byte of the coefficient
  if (rawBytes[0] > 0x7f) {
    exponent = Buffer.from([rawBytes.length + 1]);
    coefficient = Buffer.from([0, rawBytes[0], rawBytes[1]]);
  } else {
    exponent = Buffer.from([rawBytes.length]);
    coefficient = Buffer.from([rawBytes[0], rawBytes[1], rawBytes[2]]);
  }

  return combine(exponent, coefficient);
}

/**
 * Calculates new bits from the start and end blocks. This covers a period of
 * 2016 blocks. It restricts the upper board to 8 weeks and the lower bound to
 * 3.5 days.
 *
 * The new target is calculated with the formula:
 * ```
 * target = (oldtarget * timediff) / TWO_WEEKS
 * ```
 * The new target is then converted into bits
 */
export function calcNewBits(prevBits: Buffer, timediff: bigint): Buffer {
  const TWO_WEEKS = 86400 * 14;
  const UPPER_DIFF = TWO_WEEKS * 4;
  const LOWER_DIFF = TWO_WEEKS / 4;
  const MAX_TARGET = BigInt(0xffff) * BigInt(256) ** BigInt(0x1d - 3);

  // greater than 8 weeks, make it 8 weeks
  if (timediff > UPPER_DIFF) {
    timediff = BigInt(UPPER_DIFF);
  }

  // less than 3.5 days, make it 3.5 days
  if (timediff < LOWER_DIFF) {
    timediff = BigInt(LOWER_DIFF);
  }

  let newTarget = (bitsToTarget(prevBits) * timediff) / BigInt(TWO_WEEKS);

  if (newTarget > MAX_TARGET) {
    newTarget = MAX_TARGET;
  }

  return targetToBits(newTarget);
}
