import { decodeNum, encodeNum } from "../../NumCodec";

/**
 * Pops from the top of the stack, adds 1 to that number
 * and pushes the resulut onto the stack
 * @param stack
 */
export function op1Add(stack: Buffer[]): boolean {
  if (stack.length < 1) return false;

  const a = decodeNum(stack.pop());
  stack.push(encodeNum(a + 1n));

  return true;
}
