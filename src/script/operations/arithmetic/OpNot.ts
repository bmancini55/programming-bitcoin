import { decodeNum, encodeNum } from "../../NumCodec";

/**
 * Pops one value off the stack and pushes the negation onto the stack.
 * If the input is 0 or 1, it is flipped. Otherwise the output will be 0.
 * @param stack
 */
export function opNot(stack: Buffer[]): boolean {
  if (stack.length < 1) return false;

  const a = decodeNum(stack.pop());
  let result: bigint;
  if (a === 0n) {
    result = 1n;
  } else if (a === 1n) {
    result = 0n;
  } else {
    result = 0n;
  }
  stack.push(encodeNum(result));

  return true;
}
