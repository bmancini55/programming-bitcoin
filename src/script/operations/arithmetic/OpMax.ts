import { decodeNum, encodeNum } from "../../NumCodec";

/**
 * Pops two elements off the stack and pushes one onto the stack.
 * Returns the larger of a and b.
 * @param stack
 */
export function opMax(stack: Buffer[]): boolean {
  if (stack.length < 2) return false;

  const b = decodeNum(stack.pop());
  const a = decodeNum(stack.pop());

  let result: bigint;
  if (a > b) {
    result = a;
  } else {
    result = b;
  }
  stack.push(encodeNum(result));

  return true;
}
