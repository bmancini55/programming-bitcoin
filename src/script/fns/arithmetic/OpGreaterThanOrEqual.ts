import { decodeNum, encodeNum } from "../../NumCodec";

/**
 * Pops two elements off the stack and pushes one onto the stack.
 * Returns 1 if a is greater than or equal to b, 0 otherwise.
 * @param stack
 */
export function opGreaterThanOrEqual(stack: Buffer[]): boolean {
  if (stack.length < 2) return false;

  const b = decodeNum(stack.pop());
  const a = decodeNum(stack.pop());

  let result: bigint;
  if (a >= b) {
    result = 1n;
  } else {
    result = 0n;
  }
  stack.push(encodeNum(result));

  return true;
}
