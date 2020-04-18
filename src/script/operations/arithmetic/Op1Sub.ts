import { decodeNum, encodeNum } from "../../NumCodec";

/**
 * Pops from the top of the stack, subtracts 1 from that number
 * and pushes the result onto the stack
 * @param stack
 */
export function op1Sub(stack: Buffer[]): boolean {
  if (stack.length < 1) return false;

  const a = decodeNum(stack.pop());
  stack.push(encodeNum(a - 1n));

  return true;
}
