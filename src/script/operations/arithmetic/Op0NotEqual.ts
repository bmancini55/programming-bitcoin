import { decodeNum, encodeNum } from "../../NumCodec";

/**
 * Returns 0 if the input is 0. 1 otherwise. Pops one element
 * off the stack and pushes one onto the stack
 * @param stack
 */
export function op0NotEqual(stack: Buffer[]): boolean {
  if (stack.length < 1) return false;

  const a = decodeNum(stack.pop());

  let result = 1n;
  if (a !== 0n) {
    result = 1n;
  } else {
    result = 0n;
  }
  stack.push(encodeNum(result));

  return true;
}
