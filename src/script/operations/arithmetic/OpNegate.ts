import { decodeNum, encodeNum } from "../../NumCodec";

/**
 * Pops from the top of the stack, negates the number and pushes it
 * onto the stack
 * @param stack
 */
export function opNegate(stack: Buffer[]): boolean {
  if (stack.length < 1) return false;

  const a = decodeNum(stack.pop());
  stack.push(encodeNum(-a));

  return true;
}
