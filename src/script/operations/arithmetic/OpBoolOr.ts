import { decodeNum, encodeNum } from "../../NumCodec";

/**
 * Pops two elements off the stack and pushes one onto the stack.
 * If a or b is not 0, the output is 1. Otherwise 0.
 * @param stack
 */
export function opBoolOr(stack: Buffer[]): boolean {
  if (stack.length < 2) return false;

  const b = decodeNum(stack.pop());
  const a = decodeNum(stack.pop());

  let result: bigint;
  if (a !== 0n || b !== 0n) {
    result = 1n;
  } else {
    result = 0n;
  }
  stack.push(encodeNum(result));

  return true;
}
