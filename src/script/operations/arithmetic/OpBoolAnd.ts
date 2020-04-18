import { decodeNum, encodeNum } from "../../NumCodec";

/**
 * Pops two elements off the stack and pushes one onto the stack.
 * If both a and b are not 0, the output is 1. Otherwise 0.
 * @param stack
 */
export function opBoolAnd(stack: Buffer[]): boolean {
  if (stack.length < 2) return false;

  const b = decodeNum(stack.pop());
  const a = decodeNum(stack.pop());

  let result: bigint;
  if (a !== 0n && b !== 0n) {
    result = 1n;
  } else {
    result = 0n;
  }
  stack.push(encodeNum(result));

  return true;
}
