import { hash256 } from "./Hash256";
import { combine } from "./BufferUtil";

/**
 * Performs a hash256 on the concatenation of the left and right values provided
 * @param hash1
 * @param hash2
 */
export function merkleParent(hash1: Buffer, hash2: Buffer): Buffer {
  return hash256(combine(hash1, hash2));
}

/**
 * Given a list of hashes, this will create a list of parents by pairing the
 * provided hashes. For examples if the list is [a,b,c,d] it will return the
 * merkle parents for a||b and c||d. If there is an odd number of hashes, the
 * last value will be duplicated. For example: [a,b,c] will be a||b and c||c. As
 * a result this method will always return ceil(len(hashes)/2).
 * @param hashes
 */
export function merkleParentLevel(hashes: Buffer[]): Buffer[] {
  // when the number of hashes is odd, we need to duplicate the final value
  if (hashes.length % 2 === 1) {
    hashes.push(hashes[hashes.length - 1]);
  }

  // combine the hashes
  const parents = [];
  for (let i = 0; i < hashes.length; i += 2) {
    const hash1 = hashes[i];
    const hash2 = hashes[i + 1];
    const parent = merkleParent(hash1, hash2);
    parents.push(parent);
  }

  return parents;
}

/**
 * Calculates the merkle root by successively calculating the merkle parents
 * until there is only a single hash value remaining. This single hash value is
 * the merkle root. There will be log2(n) iterations to find the merkle root.
 * @param hashes
 */
export function merkleRoot(hashes: Buffer[]): Buffer {
  while (hashes.length > 1) {
    hashes = merkleParentLevel(hashes);
  }
  return hashes[0];
}
