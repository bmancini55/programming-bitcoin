/**
 * Pure JavaScript implementation using BigInt of murmurhash. Ported from:
 * http://stackoverflow.com/questions/13305290/is-there-a-pure-python-implementation-of-murmurhash
 * @param data
 * @param seed
 */
export function murmur3(data: Buffer, seed: bigint = 0n): bigint {
  const c1 = BigInt(0xcc9e2d51);
  const c2 = BigInt(0x1b873593);

  const length = data.length;
  const roundedEnd = length & 0xfffffffc; // round down to 4 byte block

  let h1 = seed;
  let k1: bigint;
  for (let i = 0; i < roundedEnd; i += 4) {
    k1 =
      (BigInt(data[i]) & 0xffn) |
      ((BigInt(data[i + 1]) & 0xffn) << 8n) |
      ((BigInt(data[i + 2]) & 0xffn) << 16n) |
      (BigInt(data[i + 3]) << 24n); // little endian load order
    k1 *= c1;
    k1 = (k1 << 15n) | ((k1 & 0xffffffffn) >> 17n); // ROTL32(k1,15)
    k1 *= c2;
    h1 ^= k1;
    h1 = (h1 << 13n) | ((h1 & 0xffffffffn) >> 19n); // ROTL32(h1,13)
    h1 = h1 * 5n + 0xe6546b64n;
  }

  // tail
  k1 = 0n;
  const val = length & 0x03;
  if (val === 3) {
    k1 = (BigInt(data[roundedEnd + 2]) & 0xffn) << 16n;
  }

  // fallthrough
  if (val === 2 || val === 3) {
    k1 |= (BigInt(data[roundedEnd + 1]) & 0xffn) << 8n;
  }

  // fallthrough
  if (val === 1 || val === 2 || val === 3) {
    k1 |= BigInt(data[roundedEnd]) & 0xffn;
    k1 *= c1;
    k1 = (k1 << 15n) | ((k1 & 0xffffffffn) >> 17n); // ROTL32(k1,15)
    k1 *= c2;
    h1 ^= k1;
  }

  // finalization
  h1 ^= BigInt(length);

  // fmix(h1)
  h1 ^= (h1 & 0xffffffffn) >> 16n;
  h1 *= 0x85ebca6bn;
  h1 ^= (h1 & 0xffffffffn) >> 13n;
  h1 *= 0xc2b2ae35n;
  h1 ^= (h1 & 0xffffffffn) >> 16n;
  return h1 & 0xffffffffn;
}
