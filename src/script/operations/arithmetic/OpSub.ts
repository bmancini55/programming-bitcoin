import { decodeNum, encodeNum } from "../../NumCodec";

/**
 * Performs a numeric subtract of the top two elements A and B and
 * pushes the result onto the stack.  B is subtracted from A.
 * @param stack
 */
export function opSub(stack: Buffer[]): boolean {
  if (stack.length < 2) return false;

  const b = decodeNum(stack.pop());
  const a = decodeNum(stack.pop());
  stack.push(encodeNum(a - b));

  return true;
}
