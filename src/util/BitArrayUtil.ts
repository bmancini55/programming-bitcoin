import { divmod } from "./BigIntMath";

/**
 * Converts a bit-array into bytes
 * @param arr
 */
export function bitArrayToBuf(arr: number[]) {
  if (arr.length % 8 !== 0) throw new Error("Bit array must be divisible by 8");
  const result = Buffer.alloc(arr.length / 8);
  for (let i = 0; i < arr.length; i++) {
    const bit = arr[i];
    if (bit) {
      const [byteIndex, bitIndex] = divmod(BigInt(i), 8n);
      result[Number(byteIndex)] |= 1 << Number(bitIndex);
    }
  }
  return result;
}
