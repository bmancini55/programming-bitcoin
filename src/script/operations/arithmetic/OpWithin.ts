import { decodeNum, encodeNum } from "../../NumCodec";

/**
 * Pops two elements off the stack and pushes one onto the stack.
 * Returns 1 if x is within the specified range (left-inclusive),
 * 0 otherwise.
 * @param stack
 */
export function opWithin(stack: Buffer[]): boolean {
  if (stack.length < 3) return false;

  const max = decodeNum(stack.pop());
  const min = decodeNum(stack.pop());
  const x = decodeNum(stack.pop());

  let result: bigint;
  if (x >= min && x < max) {
    result = 1n;
  } else {
    result = 0n;
  }
  stack.push(encodeNum(result));

  return true;
}
