import { decodeNum, encodeNum } from "../../NumCodec";

/**
 * Pops from the top of the stack and pushes the
 * absolute value onto the stack
 * @param stack
 */
export function opAbs(stack: Buffer[]): boolean {
  if (stack.length < 1) return false;

  const a = decodeNum(stack.pop());
  if (a < 0n) {
    stack.push(encodeNum(-a));
  } else {
    stack.push(encodeNum(a));
  }

  return true;
}
