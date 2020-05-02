import { murmur3 } from "./util/Murmurhash";
import { bigToBufLE } from "./util/BigIntUtil";

/**
 * Bloom Filter class that complies with BIP0037. This method uses murmurhash
 * and accepts a size (number of bytes), function count and a tweak value.
 *
 * These values, along with the BIP0037 constan of 0xfba4c795 are used to
 * calculate a seed for use with murmurhash.
 *
 * This method also tracks set values via a bit array and with a bit flag
 * BigInt.
 */
export class BloomFilter {
  public bitArray: number[];
  public bits: bigint;
  public static BIP37_CONSTANT = 0xfba4c795n;

  public get bytes(): Buffer {
    return bigToBufLE(this.bits);
  }

  constructor(
    readonly size: bigint,
    readonly fnCount: bigint,
    readonly tweak: bigint
  ) {
    this.bitArray = new Array(Number(size) * 8).fill(0);
    this.bits = 0n;
  }

  public add(val: Buffer) {
    const bitFieldSize = this.size * 8n;
    for (let i = 0n; i < this.fnCount; i++) {
      const seed = i * BloomFilter.BIP37_CONSTANT + this.tweak;
      const h = murmur3(val, seed);
      const bit = h % bitFieldSize;
      this.bitArray[Number(bit)] = 1;
      this.bits |= 1n << bit;
    }
  }
}
